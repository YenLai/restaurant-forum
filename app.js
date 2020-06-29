const express = require('express')
const hbs = require('express-handlebars')
const PORT = 3000

const app = express()
app.engine('hbs', hbs({ defaultLayout: 'main', extname: 'hbs' }))
app.set('view engine', 'hbs')


app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`)
})

require('./routes')(app)