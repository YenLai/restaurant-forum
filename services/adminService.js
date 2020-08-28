const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] }).then(restaurants => {
      callback({ restaurants: restaurants })
    })
      .catch(error => callback({ status: 'error', message: error }))
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then((restaurant) => {
        callback({ restaurant })
      })
      .catch(error => callback({ status: 'error', message: error }))
  },
  getCategories: (req, res, callback) => {
    if (req.params.id) {
      return Category.findAll({ raw: true, nest: true })
        .then(categories => {
          return Category.findByPk(req.params.id)
            .then(category => {
              callback({ categories, category: category.toJSON() })
            })
        })
        .catch(error => callback({ status: 'error', message: error }))
    }
    else {
      Category.findAll({ raw: true, nest: true })
        .then(categories => {
          callback({ categories })
        })
        .catch(error => callback({ status: 'error', message: error }))
    }
  },
  getUsers: (req, res, callback) => {
    return User.findAll({ raw: true, nest: true })
      .then(users => {
        return callback({ users })
      })
      .catch(error => callback({ status: 'error', message: error }))
  },
  putUser: (req, res, callback) => {
    return User.findByPk(req.params.id)
      .then(user => {
        return user.update({
          isAdmin: !user.isAdmin
        })
      })
      .then(() => {
        req.flash('success_messages', 'user role成功更新!')
        callback({ status: 'success', message: '' })
      })
      .catch((error) => callback({ status: 'error', message: error }))
  },
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant
          .destroy()
          .then(() => callback({ status: 'success', message: '' }))
      })
      .catch(error => callback({ status: 'error', message: error }))
  },
  postRestaurant: (req, res, callback) => {
    const { name, tel, address, opening_hours, description, CategoryId } = req.body
    if (!name) {
      return callback({ status: 'error', message: 'name didn\'t exist.' })
    }
    const { file } = req
    uploadImg(file)
      .then((img) => {
        return Restaurant.create({
          name,
          tel,
          address,
          opening_hours,
          description,
          image: img.data.link,
          CategoryId
        })
          .then(() => { callback({ status: 'success', message: '餐廳新增成功。' }) })
          .catch((error) => callback({ status: 'error', message: error }))
      })
      .catch((error) => {
        // file doesn't exist or fail to upload.
        return Restaurant.create({
          name,
          tel,
          address,
          opening_hours,
          description,
          image: null,
          CategoryId
        })
          .then(() => { callback({ status: 'success', message: '餐廳新增成功。' }) })
          .catch((error) => callback({ status: 'error', message: error }))
      })

  },
  putRestaurant: (req, res, callback) => {
    const { name, tel, address, opening_hours, description, CategoryId } = req.body
    if (!name) {
      return callback({ status: 'error', message: 'name didn\'t exist.' })
    }
    const { file } = req
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        uploadImg(file)
          .then((img) => {
            return restaurant.update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: img.data.link,
              CategoryId
            })
              .then(() => { callback({ status: 'success', message: '餐廳修改成功。' }) })
              .catch((error) => callback({ status: 'error', message: error }))
          })
          .catch((error) => {
            // file doesn't exist or fail to upload.
            console.log(error)
            return restaurant.update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: restaurant.image,
              CategoryId
            })
              .then(() => { callback({ status: 'success', message: '餐廳修改成功。' }) })
              .catch((error) => callback({ status: 'error', message: error }))
          })
      })
  },
  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: 'name didn\'t exist.' })
    }
    else {
      Category.create({ name: req.body.name })
        .then(() => {
          callback({ status: 'success', message: 'category成功建立!' })
        })
        .catch((error) => callback({ status: 'error', message: error }))
    }
  },
  putCategory: (req, res, callback) => {
    Category.findByPk(req.params.id)
      .then(category => {
        return category.update({
          name: req.body.name
        })
      })
      .then(() => {
        callback({ status: 'success', message: 'category成功更新' })
      })
      .catch((error) => callback({ status: 'error', message: error }))
  },
  deleteCategory: (req, res, callback) => {
    Category.findByPk(req.params.id)
      .then((category) => {
        return category.destroy()
      })
      .then(() => {
        callback({ status: 'success', message: 'category成功刪除' })
      })
      .catch((error) => callback({ status: 'error', message: error }))
  },
}

function uploadImg(file) {
  return new Promise((resolve, reject) => {
    imgur.setClientID(IMGUR_CLIENT_ID)
    if (file) {
      imgur.upload(file.path, (error, img) => {
        if (error)
          reject(error)
        resolve(img)
      })
    }
    else {
      reject('file doesn\'t exist.')
    }
  })
}
module.exports = adminService