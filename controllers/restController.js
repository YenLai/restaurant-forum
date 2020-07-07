const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
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
        console.log(totalPage)
        return res.render('restaurants', {
          restaurants: data,
          categories, categoryId,
          page, pages, totalPage, prev, next
        })
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