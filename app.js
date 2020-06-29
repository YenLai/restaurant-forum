const express = require('express')
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')
const PORT = 3000
const db = require('./models')
const { urlencoded } = require('body-parser')

const app = express()
app.engine('hbs', hbs({ defaultLayout: 'main', extname: 'hbs' }))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))


app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`)
})

require('./routes')(app)