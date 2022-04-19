const express = require('express')
const app = express()
const havaintoRouter = require('./controllers/havainnot')
const usersRouter = require('./controllers/users')
const wikiRouter = require('./controllers/wiki')
const config = require('./utils/config')
const mongoose = require('mongoose')

const logger = require('./utils/logger')
const requestLogger = require('./middlewares/requestLogger')

mongoose.connect(config.MONGODB_URI)
.then(() => {logger.info('Connected')})
.catch((error) => {logger.info('Error:', error.message)})

app.use(express.json())
//app.use(requestLogger)

app.use('/api/wiki', wikiRouter)
//esim http://localhost:3001/api/wiki/wikiapi/kesykyyhky
//esim http://localhost:3001/api/wiki/info/hauki
//esim http://localhost:3001/api/wiki/image/hauki/200

app.use('/api/havainnot', havaintoRouter)
//esim http://localhost:3001/api/havainnot/1

app.use('/api/user', usersRouter)

const PORT = config.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = app