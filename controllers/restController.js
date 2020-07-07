const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({ include: Category }).then(restaurants => {
      const data = restaurants.map(rest => ({
        ...rest.dataValues,
        description: rest.dataValues.description.substring(0, 50)
      }))
      return res.render('restaurants', {
        restaurants: data
      })
    })
  },
  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id, { include: Category }).then(restaurant => {
      return res.render('detail', { restaurant: restaurant.toJSON() })
    })
  }
}

module.exports = restController