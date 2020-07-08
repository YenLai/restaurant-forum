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
      .catch((err) => res.send(err))
  },
  deleteComment: (req, res) => {
    return Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
          .then(() => res.redirect(`/restaurants/${comment.RestaurantId}`))
      })
      .catch((err) => res.send(err))
  }
}

module.exports = commentController