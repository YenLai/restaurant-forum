const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const Comment = db.Comment
const Favorite = db.Favorite
const pageLimit = 10

const restService = {
  getRestaurants: (req, res, callback) => {
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
        categoryName: rest.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(rest.id) || false,
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(rest.id)
      }))
      Category.findAll({ raw: true, nest: true }).then(categories => {
        callback({
          restaurants: data,
          categories, categoryId,
          page, pages, totalPage, prev, next
        })
      })
    })
      .catch((error) => callback({ status: 'error', message: error }))
  },
  getRestaurant: (req, res, callback) => {
    Restaurant.findByPk(req.params.restaurantId, {
      include: [
        Category,
        { model: Comment, include: [User] },
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
        const isLiked = req.user.LikedRestaurants.map(d => d.id).includes(restaurant.id)
        restaurant.Comments = restaurant.Comments.sort((a, b) => b.createdAt - a.createdAt)
        return restaurant.increment('viewCounts')
          .then(() => {
            return callback({
              restaurant: restaurant.toJSON(),
              isFavorited, isLiked
            })
          })
      })
      .catch((error) => callback({ status: 'error', message: error }))
  },
  getFeeds: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, limit: 10, order: [['createdAt', 'DESC']], include: [Category] })
      .then(restaurants => {
        Comment.findAll({ limit: 10, raw: true, nest: true, order: [['createdAt', 'DESC']], include: [User, Restaurant] })
          .then(comments => {
            callback({ restaurants, comments })
          })
      })
      .catch((error) => callback({ status: 'error', message: error }))
  },
  getDashboards: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurant => {
        Comment.findAndCountAll({ where: { RestaurantId: restaurant.id } })
          .then(result => {
            callback({
              restaurant: restaurant.toJSON(),
              comments: result.count,
              viewCounts: restaurant.viewCounts,
              FavoritedUserCounts: restaurant.FavoritedUsers.length
            })
          })
      })
      .catch((error) => callback({ status: 'error', message: error }))
  },
  getTopRestaurants: (req, res, callback) => {
    return Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurants => {
        restaurants = restaurants.map(rest => ({
          ...rest.dataValues,
          description: rest.dataValues.description.substring(0, 50),
          FavoriteCount: rest.FavoritedUsers.length,
          isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(rest.id)
        }))
        restaurants = restaurants.sort((a, b) => (b.FavoriteCount - a.FavoriteCount)).slice(0, 10)
        callback({ restaurants })
      })
      .catch((error) => callback({ status: 'error', message: error }))
  },
}


module.exports = restService