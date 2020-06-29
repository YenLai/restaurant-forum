const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true }).then(restaurants => {
      return res.render('admin/restaurants', { restaurants })
    })
  },

  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },

  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_messages', '餐廳名稱為必填欄位。')
      return res.redirect('back')
    }
    return Restaurant.create({
      name, tel, address, opening_hours, description
    }).then(() => {
      req.flash('success_messages', '餐廳新增成功。')
      res.redirect('/admin/restaurants')
    })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => {
      return res.render('admin/detail', { restaurant })
    })
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => {
      return res.render('admin/create', { restaurant })
    })
  },

  putRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      return restaurant.update({
        name, tel, address, opening_hours, description
      })
    }).then(() => {
      req.flash('success_messages', '餐廳更新成功')
      return res.redirect(`/admin/restaurants/${req.params.id}`)
    })
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then((restaurant) => {
      restaurant.destroy()
        .then(() => res.redirect('/admin/restaurants'))
    })
  }
}


module.exports = adminController