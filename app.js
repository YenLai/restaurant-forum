const express = require('express')
const hbs = require('express-handlebars')
const PORT = 3000

const app = express()
app.engine('hbs', hbs({ defaultLayout: 'main', extname: 'hbs' }))
app.set('view engine', 'hbs')

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`)
})