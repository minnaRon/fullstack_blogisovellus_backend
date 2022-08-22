//tuodaan tiedostoon index.js:
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')

//const http = require('http')
const express = require('express') //
const app = express()
const cors = require('cors')

const mongoose = require('mongoose')


//const Blog = mongoose.model('Blog', blogSchema)

//const mongoUrl = 'mongodb://localhost/bloglist'
const mongoUrl = process.env.MONGODB_URI
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())

//tuodaan tiedostoon index.js
app.use('/api/blogs', blogsRouter)


app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
