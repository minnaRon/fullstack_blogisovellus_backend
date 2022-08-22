const config = require('./utils/config')
const express = require('express') //
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
//kun omia: const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info('connecting to', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

//kun front build: app.use(express.static('build'))
app.use(cors())
app.use(express.json())
//kun oma middleware loggeri: app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)

//kun oma middleware tuntemattomalle routelle: app.use(middleware.unknownEndpoint)
//kun oma middleware virheidenkäsittelylle: app.use(middleware.errorHandler)

module.exports = app
