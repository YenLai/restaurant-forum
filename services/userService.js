const db = require('../models')
const User = db.User
const Favorite = db.Favorite
const Like = db.Like
const Comment = db.Comment
const Restaurant = db.Restaurant
const Followship = db.Followship
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const bcrypt = require('bcryptjs')

const userService = {
  signUp: (req, res, callback) => {
    const { name, email, password, passwordCheck } = req.body

    if (password !== passwordCheck) {
      req.flash('error_messages', '密碼與確認密碼不相符。')
      return callback({ status: 'error', message: '密碼與確認密碼不相符。' })
    }
    User.findOne({ where: { email } }).then(user => {
      if (user) {
        req.flash('error_messages', '該email已經註冊過。')
        return callback({ status: 'error', message: '該email已經註冊過。' })
      }
      else {
        User.create({
          name,
          email,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
        }).then(user => {
          req.flash('success_messages', '帳號成功註冊。')
          return callback({ status: 'success', message: '帳號成功註冊。' })
        })
      }
    })
      .catch(error => callback({ status: 'error', message: error }))
  },
  getUser: (req, res, callback) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
      .then(user => {
        return Comment.findAll({
          where: { UserId: user.id },
          raw: true,
          nest: true,
          include: Restaurant
        })
          .then((result) => {
            console.log(user.Followings)
            let myComments = result.map(c => ({
              id: c.Restaurant.id,
              image: c.Restaurant.image,
              createdAt: c.createdAt
            }))
            myComments = removeDuplicatesComments(myComments.sort((a, b) => (a.id - b.id))).sort((a, b) => (b.createdAt - a.createdAt))
            let isFollowing = req.user.Followings.map(d => d.id).includes(Number(req.params.id))
            callback({
              _user: user.toJSON(),
              isCurrentUser: req.user.id === Number(req.params.id),
              isFollowing,
              myComments,
              Followers: user.Followers.sort((a, b) => b.Followship.createdAt - a.Followship.createdAt),
              Followings: user.Followings.sort((a, b) => b.Followship.createdAt - a.Followship.createdAt),
              Favorited: user.FavoritedRestaurants.sort((a, b) => b.Favorite.createdAt - a.Favorite.createdAt),
            })
          })
      })
      .catch(error => callback({ status: 'error', message: `${error}` }))
  },
  getTopUser: (req, res, callback) => {
    return User.findAll({ include: [{ model: User, as: 'Followers' }] })
      .then(users => {
        users = users.map(user => ({
          ...user.dataValues,
          FollowerCount: user.Followers.length,
          isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
        }))
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
        callback({ users })
      })
      .catch((error) => callback({ status: 'error', message: error }))
  },
  putUser: (req, res, callback) => {
    const { file } = req
    return User.findByPk(req.params.id)
      .then((user) => {
        uploadImg(file)
          .then((img) => {
            user.update({
              name: req.body.name,
              image: img.data.link
            })
              .then(() => {
                req.flash('success_messages', 'User was successfully updated!')
                return callback({ status: 'success', message: '' })
              })
              .catch((error) => callback({ status: 'error', message: error }))
          })
          .catch((err) => {
            // file doesn't exist or fail to upload.
            return user.update({
              name: req.body.name,
              image: user.image
            })
              .then(() => {
                req.flash('success_messages', 'User was successfully updated!')
                return callback({ status: 'success', message: '' })
              })
              .catch((error) => callback({ status: 'error', message: error }))
          })
      })
      .catch((error) => callback({ status: 'error', message: error }))
  },
  addFavorite: (req, res, callback) => {
    Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(() => callback({ status: 'success', message: '' }))
      .catch((error) => callback({ status: 'error', message: error }))
  },
  deleteFavorite: (req, res, callback) => {
    return Favorite.findOne({ where: { UserId: req.user.id, RestaurantId: req.params.restaurantId } })
      .then((favorite) => {
        favorite.destroy()
      })
      .then(() => callback({ status: 'success', message: '' }))
      .catch((error) => callback({ status: 'error', message: error }))
  },
  addLike: (req, res, callback) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(() => callback({ status: 'success', message: '' }))
      .catch((error) => callback({ status: 'error', message: error }))
  },
  deleteLike: (req, res, callback) => {
    return Like.findOne({ where: { UserId: req.user.id, RestaurantId: req.params.restaurantId } })
      .then((like) => {
        like.destroy()
      })
      .then(() => callback({ status: 'success', message: '' }))
      .catch((error) => callback({ status: 'error', message: error }))
  },
  addFollowing: (req, res, callback) => {
    if (req.user.id === Number(req.params.userId))
      return callback({ status: 'error', message: '不能追蹤自己' })
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then(() => callback({ status: 'success', message: '' }))
      .catch((error) => callback({ status: 'error', message: error }))
  },
  deleteFollowing: (req, res, callback) => {
    return Followship.findOne({ where: { followerId: req.user.id, followingId: req.params.userId } })
      .then(followship => {
        followship.destroy()
      })
      .then(() => callback({ status: 'success', message: '' }))
      .catch((error) => callback({ status: 'error', message: error }))
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

module.exports = userService