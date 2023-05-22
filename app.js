const path = require('path')
const express = require('express') // basic express server
const mongoose = require('mongoose')
const dotenv = require('dotenv') // will have our config variables
const morgan = require('morgan') // for login - any kind of request will be showed in console
const exphbs = require('express-handlebars') // express handlebars
const methodOverride = require('method-override')
const passport = require('passport') // passport authentication strategy
const session = require('express-session') // for passport to work with sessions
const MongoStore = require('connect-mongo') 
const connectDB = require('./config/db') // bring the connection to our database file


// Load config file
dotenv.config({path: './config/config.env' }) // will have our Google variables

// Passport config
require('./config/passport')(passport) // pass in as argument the passport include from app.js to passport.js

connectDB() // connection to DB

const app = express() // initialize app.js


// Body parser middleware
app.use(express.urlencoded({ extended: false })) // to get the data from request body (messages.js route file)
app.use(express.json())

// Method override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

// Logging (morgan)
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')) // morgan middleware
}

// Handlebars Helpers
const {formatDate, stripTags, truncate, editIcon, select,ifCond} = require('./helpers/hbs')

// Handlebars - to use .hbs - 
app.engine(
  '.hbs',
  exphbs({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
      ifCond
    },
    defaultLayout: 'main', // main.hbs in views/layouts
    extname: '.hbs',
  })
)
app.set('view engine', '.hbs');



// Sessions above passport - middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false, // we dont want to save a session if nothing is modified
    saveUninitialized: false, // dont create a session untill something was stored
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI}) // mongoose connection
    //store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
)


// Passport middleware
app.use(passport.initialize())
app.use(passport.session()) // use sessions to auth


// Set global variable
app.use(function(req,res,next) {
  res.locals.user = req.user || null
  next()
})

// Static folder - current directory (__dirname ), public folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes files - link
app.use('/', require('./routes/index')) // top level requests.
app.use('/auth', require('./routes/auth'))
app.use('/messages', require('./routes/messages'))
app.use('/admin', require('./routes/admin'))




const PORT = process.env.PORT || 5000 // set the PORT

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))
// Show environment (production or development mode) and the PORT