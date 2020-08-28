const express = require('express')
const router = express.Router()
const adminController = require('../controllers/api/adminController')
const restController = require('../controllers/api/restController')
const userController = require('../controllers/api/userController')
const commentController = require('../controllers/api/commentController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const passport = require('../config/passport')
const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  }
  else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

router.get('/get_current_user', authenticated, userController.getCurrentUser)
router.get('/users/top', authenticated, userController.getTopUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.deleteFollowing)

router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)
router.get('/admin/categories', authenticated, authenticatedAdmin, adminController.getCategories)
router.get('/admin/categories/:id', authenticated, authenticatedAdmin, adminController.getCategories)
router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.deleteRestaurant)
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.post('/admin/categories', authenticated, authenticatedAdmin, adminController.postCategory)
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, adminController.putCategory)
router.delete('/admin/categories/:id', authenticated, authenticatedAdmin, adminController.deleteCategory)
router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id', authenticated, authenticatedAdmin, adminController.putUser)

router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/:restaurantId', authenticated, restController.getRestaurant)
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.deleteFavorite)
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.deleteLike)
router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticated, commentController.deleteComment)

router.post('/signin', userController.signIn)

module.exports = router