const express = require('express')
const app = express()
const wikiRouter = require('./controllers/wiki')
const config = require('./utils/config')

app.use('/api/wiki', wikiRouter)
//esim http://localhost:3001/api/wiki/info/hauki
//esim http://localhost:3001/api/wiki/image/hauki/200

const PORT = config.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = app