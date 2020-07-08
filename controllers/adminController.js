const fs = require('fs')
const db = require('../models')
const imgur = require('imgur-node-api')
const user = require('../models/user')
const category = require('../models/category')
const e = require('express')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const adminController = {
  //  restaurants
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants })
      })
      .catch((err) => res.send(err))
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
    const { name, tel, address, opening_hours, description, CategoryId } = req.body
    if (!name) {
      req.flash('error_messages', '餐廳名稱為必填欄位。')
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name,
          tel,
          address,
          opening_hours,
          description,
          image: img.data.link,
          CategoryId
        }).then((restaurant) => {
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        }).catch((err) => res.send(err))
      })
    } else {
      return Restaurant.create({
        name,
        tel,
        address,
        opening_hours,
        description,
        image: null,
        CategoryId
      }).then(() => {
        req.flash('success_messages', '餐廳新增成功。')
        return res.redirect('/admin/restaurants')
      }).catch((err) => res.send(err))
    }
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        return res.render('admin/detail', { restaurant })
      })
      .catch((err) => res.send(err))
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
    const { name, tel, address, opening_hours, description, CategoryId } = req.body
    if (!name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            return restaurant.update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: file ? img.data.link : restaurant.image,
              CategoryId
            })
              .then(() => {
                req.flash('success_messages', 'restaurant was successfully to update')
                res.redirect(`/admin/restaurants/${req.params.id}`)
              })
          })
          .catch((err) => res.send(err))
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          return restaurant.update({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: restaurant.image,
            CategoryId
          })
            .then(() => {
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect(`/admin/restaurants/${req.params.id}`)
            })
        })
        .catch((err) => res.send(err))
    }
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant
          .destroy()
          .then(() => res.redirect('/admin/restaurants'))
      })
      .catch((err) => res.send(err))
  },

  // users
  getUsers: (req, res) => {
    return User.findAll({ raw: true })
      .then(users => {
        return res.render('admin/users', { users })
      })
      .catch((err) => res.send(err))
  },
  putUsers: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        return user
          .update({
            isAdmin: !user.isAdmin
          })
      })
      .then(() => {
        req.flash('success_messages', 'user role成功更新!')
        res.redirect('/admin/users')
      })
      .catch((err) => res.send(err))
  },

  // categories
  getCategories: (req, res) => {
    if (req.params.id) {
      return Category.findAll({ raw: true, nest: true })
        .then(categories => {
          return Category.findByPk(req.params.id)
            .then(category => {
              return res.render('admin/categories', { categories, category: category.toJSON() })
            })
        })
        .catch((err) => res.send(err))
    }

    else {
      Category.findAll({ raw: true, nest: true })
        .then(categories => {
          return res.render('admin/categories', { categories })
        })
        .catch((err) => res.send(err))
    }
  },
  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    }
    else {
      Category.create({ name: req.body.name })
        .then(() => {
          req.flash('success_messages', 'category成功建立!')
          return res.redirect('/admin/categories')
        })
        .catch((err) => res.send(err))
    }
  },
  putCategory: (req, res) => {
    Category.findByPk(req.params.id)
      .then(category => {
        return category.update({
          name: req.body.name
        })
      })
      .then(() => {
        req.flash('success_messages', 'category成功更新!')
        res.redirect('/admin/categories')
      })
      .catch((err) => res.send(err))
  },
  deleteCategory: (req, res) => {
    Category.findByPk(req.params.id)
      .then((category) => {
        return category.destroy()
      })
      .then(() => {
        req.flash('success_messages', 'category成功刪除!')
        res.redirect('/admin/categories')
      })
      .catch((err) => res.send(err))
  },

}


module.exports = adminController