const db = require('../models')
const User = db.User
const userService = require('../services/userService')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res) => {
    userService.signUp(req, res, (data) => {
      return res.redirect('/signin')
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入')
    return res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '成功登出')
    req.logout()
    return res.redirect('/signin')
  },
  getUser: (req, res) => {
    userService.getUser(req, res, (data) => {
      if (data.status === 'error')
        return res.send(data.message)
      return res.render('user', data)
    })
  },
  editUser: (req, res) => {
    if (req.user.id !== Number(req.params.id))
      return res.redirect('back')

    User.findByPk(req.params.id)
      .then(user => {
        res.render('user_edit', { user: user.toJSON() })
      })
      .catch(err => res.send(err))
  },
  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      if (data.status !== 'success')
        res.send(data.message)
      res.redirect(`/users/${req.user.id}`)
    })
  },
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      if (data.status === 'success')
        res.redirect('back')
      else {
        res.send(data)
      }
    })
  },
  removeFavorite: (req, res) => {
    userService.deleteFavorite(req, res, (data) => {
      if (data.status === 'success')
        res.redirect('back')
      else {
        res.send(data)
      }
    })
  },
  addLike: (req, res) => {
    userService.addLike(req, res, (data) => {
      if (data.status === 'success')
        return res.redirect('back')
      return res.send(data.message)
    })
  },
  deleteLike: (req, res) => {
    userService.deleteLike(req, res, (data) => {
      if (data.status === 'success')
        return res.redirect('back')
      return res.send(data.message)
    })
  },
  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      return res.render('topUser', data)
    })
  },
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      if (data.status === 'success')
        return res.redirect('back')
      return res.send(data.message)
    })
  },
  deleteFollowing: (req, res) => {
    userService.deleteFollowing(req, res, (data) => {
      if (data.status === 'success')
        return res.redirect('back')
      return res.send(data.message)
    })
  },
}

module.exports = userController