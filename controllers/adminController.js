const fs = require('fs')
const db = require('../models')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const adminService = require('../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },

  createRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true,
    }).then(categories => {
      return res.render('admin/create', { categories })
    }).catch((err) => res.send(err))
  },

  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/restaurants')
    })
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/detail', data)
    })
  },

  editRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        return res.render('admin/create', {
          categories,
          restaurant: restaurant.toJSON()
        })
      })
    }).catch((err) => res.send(err))

  },

  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect(`/admin/restaurants/${req.params.id}`)
    })
  },

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data.status === 'error')
        return res.redirect('/admin/restaurants')
    })
  },

  // users
  getUsers: (req, res) => {
    adminService.getUsers(req, res, (data) => {
      if (data.status === 'error')
        return res.render('admin/users', data)
    })
    return User.findAll({ raw: true, nest: true })
      .then(users => {
        return
      })
      .catch((err) => res.send(err))
  },

  putUser: (req, res) => {
    adminService.putUser(req, res, (data) => {
      if (data.status === 'success')
        return res.redirect('/admin/users')
      return res.send(data)
    })
  },

  // categories
  getCategories: (req, res) => {
    adminService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
  },
  postCategory: (req, res) => {
    adminService.postCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/categories')
    })
  },
  putCategory: (req, res) => {
    adminService.putCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/categories')
    })
  },
  deleteCategory: (req, res) => {
    adminService.deleteCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      return res.redirect('/admin/categories')
    })
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
module.exports = adminController