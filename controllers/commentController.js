const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Comment = db.Comment

const commentController = {
  postComment: (req, res) => {
    const { text, RestaurantId } = req.body
    return Comment.create({
      text,
      UserId: req.user.id,
      RestaurantId
    })
      .then(() => res.redirect(`/restaurant/${RestaurantId}`))
  }
}

module.exports = commentController