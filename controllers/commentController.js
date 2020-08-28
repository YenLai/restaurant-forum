const commentService = require('../services/commentService')

const commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      if (data.status !== 'error')
        return res.redirect(`/restaurants/${data.RestaurantId}`)
      return res.send(data.message)
    })
  },
  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      if (data.status !== 'error')
        return res.redirect(`/restaurants/${data.RestaurantId}`)
      return res.send(data.message)
    })
  }
}

module.exports = commentController