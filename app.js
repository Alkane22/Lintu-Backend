const express = require('express')
const app = express()
const havaintoRouter = require('./controllers/havainnot')
const usersRouter = require('./controllers/users')
const wikiRouter = require('./controllers/wiki')
const config = require('./utils/config')
const mongoose = require('mongoose')
const cors = require('cors')

const errorHandler = require('./middlewares/errorHandler')
const logger = require('./utils/logger')
const requestLogger = require('./middlewares/requestLogger')

app.use(cors())

mongoose.connect(config.MONGODB_URI)
.then(() => {logger.info('Connected')})
.catch((error) => {logger.info('Error:', error.message)})

app.use(express.json())
//app.use(requestLogger)

app.use('/api/wiki', wikiRouter)
//http://localhost:3001/api/wiki/wikiapi/kesykyyhky
//http://localhost:3001/api/wiki/info/hauki
//http://localhost:3001/api/wiki/image/hauki/200

app.use('/api/havainnot', havaintoRouter)
//http://localhost:3001/api/havainnot/ObjectID
//http://localhost:3001/api/havainnot/search/talitiainen

app.use('/api/user', usersRouter)
//http://localhost:3001/api/user/login
//http://localhost:3001/api/user/ObjectID

app.use(errorHandler.errorHandler)

const PORT = config.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = app