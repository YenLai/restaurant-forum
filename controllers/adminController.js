const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true }).then(restaurants => {
      console.log(restaurants)
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
  }
}

module.exports = adminController