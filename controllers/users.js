const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')

usersRouter.post('/', async (req, res) => {
    const { username, password } = req.body

    const existingUser = await User.findOne({ username })
    if (existingUser) {
        return res.status(400).json({
            error: 'username must be unique'
        })
    }

    if (password.length < 3) {
        return res.status(400).json({
            error: 'password is too short'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        passwordHash
    })

    const savedUser = await user.save()

    res.status(201).json(savedUser)
})

usersRouter.get('/', async (req, res) => {
    const users = await User.find({})
    //.populate('blogs', {url:1, title:1, author:1, id:1})
    res.json(users)
})

usersRouter.post('/login', async (req, res) => {
    //check if user/token already saved <- TODO
    //Request body should contain name and password(encrypt?:D?)
    if (typeof req.body.username === 'string') {
        const userFromDB = await User.findOne({ username: req.body.username })
        if(!userFromDB){
            res.status(404).json({error: 'Username does not exist.'})
            return
        }

        if (await bcrypt.compare(req.body.password, userFromDB.passwordHash)) {
            const userForToken = {
                username: userFromDB.username,
                id: userFromDB._id
            }

            // token expires in 60*60 seconds, that is, in one hour
            const token = jwt.sign(userForToken, process.env.SECRET_KEY, { expiresIn: 60*60 })
            res.status(200).json({ token, name: userFromDB.username })

        } else {
            res.status(400).json({ error: 'invalid password' })
        }
    } else {
        res.status(400).json({ error: "Request.body.user missing" })
    }
})

usersRouter.get('/:id', async (req, res) => {
    const userFromDB = await User.findById(req.params.id)
    if(userFromDB){
        //res.status(200).json({username: `${userFromDB.username}`, observations: `${userFromDB.observations}`})
        res.status(200).json(userFromDB)
        console.log(userFromDB);
    } else {
        res.status(404).json({error: 'User id not found'})
        console.log('wtf')
    }
})

module.exports = usersRouter