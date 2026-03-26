require('dotenv').config()
const express = require('express')

const app = express()
const morgan = require('morgan')
const helmet = require('helmet')
const session = require('express-session')
const flash = require("connect-flash");
const cookieparser = require('cookie-parser')

// DB
const ConnectDatabase = require('./app/config/dbcon')
ConnectDatabase()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(morgan('dev'))
app.use(
  helmet({
    contentSecurityPolicy: false,
    xDownloadOptions: false,
  }),
);
app.use(cookieparser())
app.use(
  session({
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);
app.use(flash())



app.use(require('./app/routes/index'))



const port = 4001

app.listen(port, (err)=>{
  if(err){
    console.log(`failed to start the server ${err} `)
  }
  console.log(`Server running on port http:/localhost:${port}`)
})