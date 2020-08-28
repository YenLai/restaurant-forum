const db = require('../models')
const Comment = db.Comment

const commentService = {
  postComment: (req, res, callback) => {
    const { text, RestaurantId } = req.body
    if (!RestaurantId) return callback({ status: 'error', message: 'Restaurnat id is not exist.' })
    if (!text) return callback({ status: 'error', message: 'text is not exist.' })

    return Comment.create({
      text,
      UserId: req.user.id,
      RestaurantId
    })
      .then(() => callback({ status: 'success', message: '', RestaurantId: RestaurantId }))
      .catch((err) => callback({ status: 'error', message: 'can not post comment.' }))
  },
  deleteComment: (req, res, callback) => {
    return Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
          .then(() => callback({ status: 'success', message: '', RestaurantId: comment.RestaurantId }))
      })
      .catch((err) => callback({ status: 'error', message: 'can not delete comment.' }))
  }
}

module.exports = commentService