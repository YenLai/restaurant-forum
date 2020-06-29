const express = require('express')
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')
const PORT = 3000
const db = require('./models')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')

const app = express()
app.engine('hbs', hbs({ defaultLayout: 'main', extname: 'hbs' }))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  console.log(req.flash('success_messages'))
  next()
})

app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`)
})

require('./routes')(app, passport)