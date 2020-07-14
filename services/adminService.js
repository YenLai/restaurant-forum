const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] }).then(restaurants => {
      callback({ restaurants: restaurants })
    })
      .catch((err) => res.send(err))
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
      .catch((err) => res.send(err))
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
        .catch((err) => res.send(err))
    }
    else {
      Category.findAll({ raw: true, nest: true })
        .then(categories => {
          callback({ categories })
        })
        .catch((err) => res.send(err))
    }
  },
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant
          .destroy()
          .then(() => callback({ status: 'success', message: '' }))
      })
      .catch((err) => res.send(err))
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
          .catch((err) => callback({ status: 'error', message: err }))
      })
      .catch((err) => {
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
          .catch((err) => callback({ status: 'error', message: err }))
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
              .catch((err) => callback({ status: 'error', message: err }))
          })
          .catch((err) => {
            // file doesn't exist or fail to upload.
            console.log(err)
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
              .catch((err) => callback({ status: 'error', message: err }))
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
        .catch((err) => callback({ status: 'error', message: err }))
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
      .catch((err) => callback({ status: 'error', message: err }))
  },
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
module.exports = adminService