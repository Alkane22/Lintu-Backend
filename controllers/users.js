const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const extractor = require('./tokenExtractor')
const { restart } = require('nodemon')

usersRouter.post('/', async (req, res) => {
    const { username, password } = req.body

    const existingUser = await User.findOne({ username })

    if (existingUser) {
        return res.status(400).json({
            error: 'käyttäjä tunnus on varattu'
        })
    }

    if (password.length < 3) {
        return res.status(400).json({
            error: 'salasana on liian lyhyt'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        passwordHash
    })

    try{
        const savedUser = await user.save()
        return res.status(201).json(savedUser)
        
    } catch (e) {
        return res.status(400).json(e)
    }
})

usersRouter.get('/', async (req, res) => {
    const users = await User.find({})
    //.populate('blogs', {url:1, title:1, author:1, id:1})
    return res.json(users)
})

usersRouter.post('/login', async (req, res) => {
    //check if user/token already saved <- TODO
    //Request body should contain name and password(encrypt?:D?)
    if (typeof req.body.username === 'string') {
        const userFromDB = await User.findOne({ username: req.body.username })
        if (!userFromDB) {
            res.status(404).json({ error: 'käyttäjä tunnusta ei ole olemassa' })
            return
        }

        if (await bcrypt.compare(req.body.password, userFromDB.passwordHash)) {
            const userForToken = {
                username: userFromDB.username,
                id: userFromDB._id
            }

            // token expires in 60*60 seconds, that is, in one hour
            const token = jwt.sign(userForToken, process.env.SECRET_KEY, { expiresIn: 60 * 60 })
            return res.status(200).json({ token, name: userFromDB.username })

        } else {
            return res.status(400).json({ error: 'väärä salasana' })
        }
    } else {
        return res.status(400).json({ error: "Request.body.user missing" })
    }
})

usersRouter.get('/checkToken', async (req, res) => {
    
    let user
    const token = extractor.getTokenFrom(req)

    //body has no token so no reason to go on
    if (!token) {
        res.status(400).json({ error: 'token missing from request' })
        return
    }

    //verify token, if invalid no reason to go on
    try {
        user = jwt.verify(token, process.env.SECRET_KEY)
    } catch (error) {
        res.status(400).json({ error: error.name })
        return
    }
    //console.log(user)

    return res.status(200).json({token:true})

})

usersRouter.get('/:id', async (req, res) => {
    //if this try does not exist sending the server "api/user/blablablabla" will crash the server
    try {
        const userFromDB = await User.findById(req.params.id)
        if (userFromDB) {
            //res.status(200).json({username: `${userFromDB.username}`, observations: `${userFromDB.observations}`})
            console.log(userFromDB);
            return res.status(200).json(userFromDB)
        } else {
            //console.log('wtf')
            return res.status(404).json({ error: 'User id not found' })
        }
    } catch (e){
        return res.status(400).end()
        //console.log(e)
    }
    
})

module.exports = usersRouter