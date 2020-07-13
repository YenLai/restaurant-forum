const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

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
}
module.exports = adminService