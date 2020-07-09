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
    const pageLimit = 8
    let offset = 0
    if (req.query.page)
      offset = (req.query.page - 1) * pageLimit

    User.findByPk(req.params.id)
      .then(user => {
        return Comment.findAndCountAll({
          where: { UserId: user.id },
          raw: true,
          nest: true,
          include: Restaurant,
          offset,
          limit: pageLimit
        })
          .then((result) => {
            let page = Number(req.query.page) || 1
            let pages = Math.ceil(result.count / pageLimit)
            let totalPage = Array.from({ length: pages }).map((_, i) => i + 1)
            let prev = page - 1 < 1 ? 1 : page - 1
            let next = page + 1 > pages ? pages : page + 1
            const myComments = result.rows.map(c => ({
              id: c.Restaurant.id,
              image: c.Restaurant.image,
            }))
            res.render('user', {
              user: user.toJSON(),
              isCurrentUser: req.user.id === Number(req.params.id),
              count: result.count,
              myComments,
              page, totalPage, prev, next,
              start: result.count > 0 ? offset + 1 : 0,
              end: offset + pageLimit > result.count ? result.count : offset + pageLimit
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
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            console.log(img)
            return user.update({
              name: req.body.name,
              image: img.data.link
            }).then(() => {
              req.flash('success_messages', 'User was successfully updated!')
              return res.redirect(`/users/${user.id}`)
            })
          })
          .catch(err => res.send(err))
      })
    }
    else {
      User.findByPk(req.params.id)
        .then(user => {
          return user.update({
            name: req.body.name,
            image: user.image
          }).then(() => {
            req.flash('success_messages', 'User was successfully updated!')
            return res.redirect(`/users/${user.id}`)
          })
        })
        .catch(err => res.send(err))
    }
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

module.exports = userController