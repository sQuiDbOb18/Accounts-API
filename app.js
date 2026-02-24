require('express-async-errors')
require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const app = express()
const accounts = require('./routes/account.route')
const logger = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const morgan = require('morgan')

app.use(express.json())
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => 
      console.log('Server running')
    )
  })
  .catch(err => {
    console.error('Failed to connect DB:', err.message)
  })
app.use(logger)
app.use(morgan('dev'))
app.use('/api/accounts', accounts)
app.use(errorHandler)
