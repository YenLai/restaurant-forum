const express = require('express')
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const cors = require('cors')

const app = express()
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('./config/passport')

app.use(cors())
app.engine('hbs', hbs({ defaultLayout: 'main', extname: 'hbs', helpers: require('./config/hbs-helpers') }))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({ secret: process.env.SESSION_KEY, resave: false, saveUninitialized: false }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})

app.listen(port, () => {
  console.log(`The server is running on http://localhost:${port}`)
})

require('./routes')(app)