const db = require('../models')
const bcrypt = require('bcryptjs')
const imgur = require('imgur-node-api')
const user = require('../models/user')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res) => {
    const { name, email, password, passwordCheck } = req.body

    if (password !== passwordCheck) {
      req.flash('error_messages', '密碼與確認密碼不相符。')
      return res.redirect('/signup')
    }
    User.findOne({ where: { email } }).then(user => {
      if (user) {
        req.flash('error_messages', '該email已經註冊過。')
        return res.redirect('/signup')
      }
      else {
        User.create({
          name,
          email,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
        }).then(user => {
          req.flash('success_messages', '帳號成功註冊。')
          return res.redirect('/signin')
        })
      }
    }).catch((err) => res.send(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入')
    return res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '成功登出')
    req.logout()
    return res.redirect('/signin')
  },
  getUser: (req, res) => {
    // (req.params.id) : String ,  (req.user.id) : Number
    User.findByPk(req.params.id)
      .then(user => {
        return Comment.findAll({
          where: { UserId: user.id },
          raw: true,
          nest: true,
          include: Restaurant,
          order: [['createdAt', 'DESC']]
        })
          .then((result) => {
            let myComments = result.map(c => ({
              id: c.Restaurant.id,
              image: c.Restaurant.image,
              createdAt: c.createdAt
            }))
            myComments = removeDuplicatesComments(myComments.sort((a, b) => (a.id - b.id))).sort((a, b) => (b.createdAt - a.createdAt))
            let isFollowing = req.user.Followings.map(d => d.id).includes(Number(req.params.id))
            res.render('user', {
              _user: user.toJSON(),
              isCurrentUser: req.user.id === Number(req.params.id),
              isFollowing,
              myComments,
              Followers: req.user.Followers.sort((a, b) => (b.Followship.createdAt - a.Followship.createdAt)),
              Followings: req.user.Followings.sort((a, b) => (b.Followship.createdAt - a.Followship.createdAt)),
              Favorited: req.user.FavoritedRestaurants.sort((a, b) => (b.Favorite.createdAt - a.Favorite.createdAt))
            })
          })
      })
      .catch(err => res.send(err))
  },
  editUser: (req, res) => {
    if (req.user.id !== Number(req.params.id))
      return res.redirect('back')

    User.findByPk(req.params.id)
      .then(user => {
        res.render('user_edit', { user: user.toJSON() })
      })
      .catch(err => res.send(err))
  },
  putUser: (req, res) => {
    const { file } = req
    return User.findByPk(req.params.id)
      .then((user) => {
        uploadImg(file)
          .then((img) => {
            return user.update({
              name: req.body.name,
              image: img.data.link
            })
          })
          .catch((err) => {
            // file doesn't exist or fail to upload.
            console.log(err)
            return user.update({
              name: req.body.name,
              image: user.image
            })
          })
          .then(() => {
            req.flash('success_messages', 'User was successfully updated!')
            return res.redirect(`/users/${user.id}`)
          })
      })
  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(() => res.redirect('back'))
      .catch(err => res.send(err))
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({ where: { UserId: req.user.id, RestaurantId: req.params.restaurantId } })
      .then((favorite) => {
        favorite.destroy()
          .then(() => res.redirect('back'))
      })
      .catch(err => res.send(err))
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(() => res.redirect('back'))
      .catch(err => res.send(err))
  },
  removeLike: (req, res) => {
    return Like.findOne({ where: { UserId: req.user.id, RestaurantId: req.params.restaurantId } })
      .then((like) => {
        like.destroy()
          .then(() => res.redirect('back'))
      })
      .catch(err => res.send(err))
  },
  getTopUser: (req, res) => {
    return User.findAll({ include: [{ model: User, as: 'Followers' }] })
      .then(users => {
        users = users.map(user => ({
          ...user.dataValues,
          FollowerCount: user.Followers.length,
          isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
        }))
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
        return res.render('topUser', { users })
      })
  },
  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then(() => res.redirect('back'))
      .catch(err => res.send(err))
  },
  removeFollowing: (req, res) => {
    return Followship.findOne({ where: { followerId: req.user.id, followingId: req.params.userId } })
      .then(followship => {
        followship.destroy()
          .then(() => res.redirect('back'))
      })
      .catch(err => res.send(err))
  }
}

function removeDuplicatesComments(sortedArray) {
  let index = 0
  let count = 0
  for (let i = 1; i < sortedArray.length; i++) {
    if (sortedArray[i].id !== sortedArray[index].id) {
      index++
      sortedArray[index] = sortedArray[i]
    }
  }
  return sortedArray.slice(0, index + 1)
}

function uploadImg(file) {
  return new Promise((resolve, reject) => {
    imgur.setClientID(IMGUR_CLIENT_ID)
    if (file) {
      imgur.upload(file.path, (err, img) => {
        if (err)
          reject(err)
        resolve(img)
      })
    }
    else {
      reject('file doesn\'t exist.')
    }
  })
}

module.exports = userController