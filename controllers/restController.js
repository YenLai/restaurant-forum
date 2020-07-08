const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const Comment = db.Comment
const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    let whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }

    Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset, limit: pageLimit }).then(result => {
      // date for pagination
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1

      // clean up restaurant date
      const data = result.rows.map(rest => ({
        ...rest.dataValues,
        description: rest.dataValues.description.substring(0, 50),
        categoryName: rest.Category.name
      }))
      Category.findAll({ raw: true, nest: true }).then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories, categoryId,
          page, pages, totalPage, prev, next
        })
      })
    }).catch((err) => res.send(err))
  },
  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] }
      ]
    })
      .then(restaurant => {
        restaurant.update({
          viewCounts: restaurant.viewCounts + 1
        }).then(() => { return res.render('detail', { restaurant: restaurant.toJSON() }) })
      })
      .catch((err) => res.send(err))
  },
  getFeeds: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true, limit: 10, order: [['createdAt', 'DESC']], include: [Category] })
      .then(restaurants => {
        Comment.findAll({ limit: 10, raw: true, nest: true, order: [['createdAt', 'DESC']], include: [User, Restaurant] })
          .then(comments => {
            return res.render('feeds', { restaurants, comments })
          })
      })
      .catch(err => res.send(err))
  },
  getDashboards: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        Comment.findAndCountAll({ where: { RestaurantId: restaurant.id } })
          .then(result => {
            res.render('dashboard', {
              restaurant: restaurant.toJSON(),
              comments: result.count,
              viewCounts: restaurant.viewCounts
            })
          })
      })
      .catch(err => res.send(err))
  }
}

module.exports = restController