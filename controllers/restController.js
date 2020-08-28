const db = require('../models')
const restService = require('../services/restService')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const Comment = db.Comment
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, (data) => {
      return res.render('restaurants', data)
    })
  },
  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, (data) => {
      return res.render('detail', data)
    })
  },
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, (data) => {
      return res.render('feeds', data)
    })
  },
  getDashboards: (req, res) => {
    restService.getDashboards(req, res, (data) => {
      return res.render('dashboard', data)
    })
  },
  getTopRestaurants: (req, res) => {
    restService.getTopRestaurants(req, res, (data) => {
      return res.render('topRestaurant', data)
    })
  },
}

module.exports = restController