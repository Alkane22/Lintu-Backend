const havaintoRouter = require('express').Router()
const havainto = require('../models/havainto')
const User = require('../models/user')
const lintu = require('../models/lintu')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const extractor = require('./tokenExtractor')
const searchWiki = require('./wikilight')

let today = new Date()

havaintoRouter.get('/', async (req, res) => {
    const havainnot = await havainto.find({})//.populate('user', {username:1}) crashes if the user doesnt exists
    res.json(havainnot)
    console.log(havainnot)
})

havaintoRouter.get('/:id', async (req, res) => {
    try {
        const havainnot = await havainto.findById(req.params.id)
        if (havainnot) {
            res.status(200).json(havainnot)
        } else {
            //if id was not found from database
            res.status(404).json({ error: 'id not found' })
        }
    } catch (e) {
        //mongoose id lenght min 12
        res.status(400).json({ error: 'id has wrong format' })
    }
})

havaintoRouter.post('/', async (req, res) => {
    const body = req.body
    const token = extractor.getTokenFrom(req)
    let user

    //body has no token so no reason to go on
    if (!token) {
        res.status(400).json({ error: 'token missing from request' })
        return
    }

    //verify token, if invalid no reason to go on
    try {
        user = jwt.verify(token, process.env.SECRET_KEY)
    } catch (error) {
        res.status(400).json({ error })
        return
    }

    let confirmedObservations = []

    //Check if all observed things are found from db.
    for (const [key, value] of Object.entries(body.observations)) {
        const dataBaseResponse = await lintu.findOne({ name: key.toLowerCase() })
        if (dataBaseResponse === null) {
            res.status(400).json({ error: key + ' does not exist in database' })
            return
        } else {
            const transformedObservation = {
                bird: dataBaseResponse._id,
                amount: value
            }
            confirmedObservations.push(transformedObservation)
        }
    }

    const timeNow = today.getTime()

    //get user database id
    const useri = await User.findById(user.id)

    try {
        const newHavainto = new havainto({
            observations: confirmedObservations,
            date: timeNow,
            county: body.county || 'Empty',
            location: body.location,
            user: useri._id,
            info: body.info || 'Empty'
        })

        const savedHavainto = await newHavainto.save()
        res.status(201).json(savedHavainto)

    } catch (e) {
        res.status(400).json({ 'error': e.name })
    }

})

havaintoRouter.delete('/:id', async (req, res) => {
    const body = req.body
    const token = extractor.getTokenFrom(req)
    let user

    //does havainto exist in db?
    const havaintoFromDB = await havainto.findById(mongoose.Types.ObjectId(req.params.id))
    if(havaintoFromDB === null){
        res.status(400).json({error: 'Havainto does not exist in database'})
        return
    }

    //body has no token so no reason to go on
    if (!token) {
        res.status(400).json({ error: 'token missing from request' })
        return
    }

    //verify token, if invalid no reason to go on
    try {
        user = jwt.verify(token, process.env.SECRET_KEY)
    } catch (error) {
        res.status(400).json({ error })
        return
    }

    //logged in user and the havainto creator has to be equal.
    if(user.id === havaintoFromDB.user.toString()){
        havaintoFromDB.delete()
        res.status(200).json({message: 'Havainto deleted'})
    } else {
        res.status(401).json({error: 'You are not authorized to delete this.'})
    }
})

//update is missing from havainto/

havaintoRouter.get('/search/:name', async (req, res) => {
    const sName = req.params.name.toLowerCase()
    const nameInDB = await lintu.find({ name: sName })

    //wikipedia page might not exist with some names..

    //if database doesnt have entry with name create new
    if (nameInDB.length !== 1) {
        //if not in database then look from wiki
        const parsedWiki = await searchWiki.searchWiki(sName)
        if (parsedWiki === null) {
            //not in db or in wiki
            res.status(404).json({ error: 'name not found' })
        } else {
            //Found from wiki, creating db entry.
            const newLintu = new lintu({
                name: sName,
                image: parsedWiki.kuva,
                lahko: parsedWiki.lahko,
                heimo: parsedWiki.heimo,
                suku: parsedWiki.suku,
                laji: parsedWiki.laji,
                elinvoimaisuus: parsedWiki.status || 'ei tietoa'
            })

            const savedLintu = await newLintu.save()

            res.status(201).json(newLintu)
        }
    } else {
        //if database has entry with name return that entry
        res.status(200).json(nameInDB)
    }

})



module.exports = havaintoRouter