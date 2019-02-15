/**
 * The starting point of the application.
 *
 * @author Adam Bergman
 * @version 1.0
 */

require('dotenv').config()
const express = require('express')
const hbs = require('express-hbs')
const session = require('express-session')
const path = require('path')
const logger = require('morgan')
const mongoose = require('./config/mongoose')

const app = express()

// connect to the database
mongoose.connect().catch(error => {
  console.error(error)
  process.exit(1)
})

// view engine setup
app.engine('hbs', hbs.express4({
  defaultLayout: path.join(__dirname, 'views', 'layouts', 'default'),
  partialsDir: path.join(__dirname, 'views', 'partials')
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

// additional middleware
app.use(logger('dev'))
app.use(express.urlencoded({ extended: false })) // Not needed? (Working without)
app.use(express.static(path.join(__dirname, 'public')))

// setup and use session middleware (https://github.com/expressjs/session)
const sessionOptions = {
  name: 'To do item', // Don't use default session cookie name.
  secret: 'uV9wjNeEtsDPz5v38bKPQPxAt8vkASty', // Change it!!! The secret is used to hash the session with HMAC.
  resave: false, // Resave even if a request is not changing the session.
  saveUninitialized: false, // Don't save a created but not modified session.
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}

app.use(session(sessionOptions))

// middleware to be executed before the routes
app.use((req, res, next) => {
  // flash messages - survives only a round trip
  res.locals.flash = req.session.flash
  delete req.session.flash

  next()
})

// routes
app.use('/', require('./routes/homeRouter'))
app.use('/todo', require('./routes/toDoRouter'))
app.use('/login', require('./routes/loginRouter'))

// catch 404
app.use((req, res, next) => {
  res.status(404)
  res.sendFile(path.join(__dirname, 'public', '404.html'))
})

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err.message || 'Internal Server Error')
})

const port = process.env.PORT || 8000
app.listen(port, () => console.log(`Server running at http://localhost:${port}/`))
