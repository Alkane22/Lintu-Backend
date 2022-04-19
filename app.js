const express = require('express')
const havaintoRouter = require('./controllers/havainnot')
const app = express()
const wikiRouter = require('./controllers/wiki')
const config = require('./utils/config')

app.use('/api/wiki', wikiRouter)
//esim http://localhost:3001/api/wiki/wikiapi/kesykyyhky
//esim http://localhost:3001/api/wiki/info/hauki
//esim http://localhost:3001/api/wiki/image/hauki/200

app.use('/api/havainnot', havaintoRouter)
//esim http://localhost:3001/api/havainnot/1

const PORT = config.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = app