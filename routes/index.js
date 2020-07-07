const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const multer = require('multer')
const commentController = require('../controllers/commentController.js')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {

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

  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', authenticated, restController.getRestaurants)
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)
  app.post('/comments', authenticated, commentController.postComment)
  app.delete('/comments/:id', authticateAdmin, commentController.deleteComment)

  app.get('/admin', authticateAdmin, (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', authticateAdmin, adminController.getRestaurants)
  app.get('/admin/restaurants/create', authticateAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authticateAdmin, upload.single('image'), adminController.postRestaurant)
  app.get('/admin/restaurants/:id', authticateAdmin, adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', authticateAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', authticateAdmin, upload.single('image'), adminController.putRestaurant)
  app.delete('/admin/restaurants/:id', authticateAdmin, adminController.deleteRestaurant)
  app.get('/admin/users', authticateAdmin, adminController.getUsers)
  app.get('/admin/users/:id', authticateAdmin, adminController.putUsers)
  app.get('/admin/categories', authticateAdmin, adminController.getCategories)
  app.get('/admin/categories/:id', authticateAdmin, adminController.getCategories)
  app.post('/admin/categories', authticateAdmin, adminController.postCategory)
  app.put('/admin/categories/:id', authticateAdmin, adminController.putCategory)
  app.delete('/admin/categories/:id', authticateAdmin, adminController.deleteCategory)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: 'true' }), userController.signIn)
  app.get('/logout', userController.logout)

}