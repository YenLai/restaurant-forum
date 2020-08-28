const db = require('../../models')
const bcrypt = require('bcryptjs')
const User = db.User
const userService = require('../../services/userService')

const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const user = require('../../models/user')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  signIn: async (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: 'required fields did not exist.' })
    }
    const { email, password } = req.body

    try {
      const user = await User.findOne({ where: { email } })
      if (!user) throw new Error('no such user found.')
      if (!bcrypt.compareSync(password, user.password)) throw new Error('passwords did not match.')

      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.json({
        status: 'success',
        message: 'ok',
        token: token,
        user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
      })
    }
    catch (error) {
      return res.status(401).json({ status: 'error', message: error })
    }
  },
  signUp: (req, res) => {
    userService.signUp(req, res, (data) => {
      res.json(data)
    })
  },
  getUser: (req, res) => {
    userService.getUser(req, res, (data) => {
      res.json(data)
    })
  },
  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      return res.json(data)
    })
  },
  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      res.json(data)
    })
  },
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      res.json(data)
    })
  },
  deleteFavorite: (req, res) => {
    userService.deleteFavorite(req, res, (data) => {
      res.json(data)
    })
  },
  addLike: (req, res) => {
    userService.addLike(req, res, (data) => {
      res.json(data)
    })
  },
  deleteLike: (req, res) => {
    userService.deleteLike(req, res, (data) => {
      res.json(data)
    })
  },
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      res.json(data)
    })
  },
  deleteFollowing: (req, res) => {
    userService.deleteFollowing(req, res, (data) => {
      res.json(data)
    })
  },
  getCurrentUser: (req, res) => {
    return res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      image: req.user.image,
      isAdmin: req.user.isAdmin
    })
  },

}
module.exports = userController