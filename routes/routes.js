const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const multer = require('multer')
const commentController = require('../controllers/commentController.js')
const upload = multer({ dest: 'temp/' })
const express = require('express')
const router = express.Router()
const passport = require('../config/passport')


const authenticated = (req, res, next) => {
  if (req.isAuthenticated())
    return next()
  else {
    return res.redirect('/signin')
  }
}

const authticateAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin)
      return next()
    else {
      res.redirect('/')
    }
  }
}

router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboards)
router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authticateAdmin, commentController.deleteComment)

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.deleteLike)
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.deleteFollowing)

router.get('/admin', authticateAdmin, (req, res) => res.redirect('/admin/restaurants'))
router.get('/admin/restaurants', authticateAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/create', authticateAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', authticateAdmin, upload.single('image'), adminController.postRestaurant)
router.get('/admin/restaurants/:id', authticateAdmin, adminController.getRestaurant)
router.get('/admin/restaurants/:id/edit', authticateAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', authticateAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authticateAdmin, adminController.deleteRestaurant)
router.get('/admin/categories', authticateAdmin, adminController.getCategories)
router.get('/admin/categories/:id', authticateAdmin, adminController.getCategories)
router.post('/admin/categories', authticateAdmin, adminController.postCategory)
router.put('/admin/categories/:id', authticateAdmin, adminController.putCategory)
router.delete('/admin/categories/:id', authticateAdmin, adminController.deleteCategory)

router.get('/admin/users', authticateAdmin, adminController.getUsers)
router.get('/admin/users/:id', authticateAdmin, adminController.putUser)
router.get('/users/top', authenticated, userController.getTopUser)
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: 'true' }), userController.signIn)
router.get('/logout', userController.logout)

module.exports = router