const havaintoRouter = require('express').Router()
const havainto = require('../models/havainto')
const User = require('../models/user')
const lintu = require('../models/lintu')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const request = require('request')//wikiImage
const jPath = require('JSONPath')//wikiImage

const extractor = require('./tokenExtractor')
const searchWiki = require('./wikilight')

let today = new Date()

havaintoRouter.get('/', async (req, res) => {
    try {
        const havainnot = await havainto.find({})
            .populate('observations.bird')
            .populate('user', { username: 1 }) //crashes if the user doesnt exists
        res.json(havainnot)
    } catch (e) {
        res.status(400).json({ error: e })
    }

    //console.log(havainnot)
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
        res.status(400).json({ error: 'Kirjaudu sisään.' })
        return
    }

    //verify token, if invalid no reason to go on
    try {
        user = jwt.verify(token, process.env.SECRET_KEY)
    } catch (error) {
        //res.status(400).json({ error })
        res.status(400).json({error: 'Kirjaudu sisään.'})
        return
    }

    let confirmedObservations = []

    //Check if all observed things are found from db.
    for (const [key, value] of Object.entries(body.observations)) {
        const dataBaseResponse = await lintu.findOne({ name: key.toLowerCase() })
        if (dataBaseResponse === null) {
            res.status(400).json({ error: key + ' ei löydy databasesta' })
            return
        } else {
            const transformedObservation = {
                bird: dataBaseResponse._id,
                amount: value
            }
            confirmedObservations.push(transformedObservation)
        }
    }

    if(confirmedObservations.length === 0){
        return res.status(400).json({error: 'sinulla tätyy olla vähintään yksi havainto'})
    }

    const timeNow = today.getTime()

    //get user database id
    const useri = await User.findById(user.id)

    try {
        const newHavainto = new havainto({
            observations: confirmedObservations,
            date: timeNow,
            county: body.county || '',
            location: body.location,
            user: useri._id,
            info: body.info || ''
        })

        const savedHavainto = await newHavainto.save()
        res.status(201).json(savedHavainto)

    } catch (e) {
        res.status(400).json({ error: e.name })
    }

})

havaintoRouter.delete('/:id', async (req, res) => {
    const body = req.body
    const token = extractor.getTokenFrom(req)
    let user

    //does havainto exist in db?
    const havaintoFromDB = await havainto.findById(mongoose.Types.ObjectId(req.params.id))
    if (havaintoFromDB === null) {
        res.status(400).json({ error: 'Havainto does not exist in database' })
        return
    }

    //body has no token so no reason to go on
    if (!token) {
        res.status(400).json({ error: 'kirjaudu sisään' })
        return
    }

    //verify token, if invalid no reason to go on
    try {
        user = jwt.verify(token, process.env.SECRET_KEY)
    } catch (error) {
        //res.status(400).json({ error })
        res.status(400).json({error: 'puuttuvat oikeudet(2).'})
        return
    }

    //logged in user and the havainto creator has to be equal.
    if (user.id === havaintoFromDB.user.toString()) {
        havaintoFromDB.delete()
        return res.status(200).json({ message: 'havainto poistettu' })
    } else {
        return res.status(401).json({ error: 'puuttuvat oikeudet.' })
    }
})

//put is missing from havainto..
//havaintoRouter.put(blablalbla)

//This is in the wrong module, needed for /search/:name, too lazy to refactor //TODO
const wikiImage = (haku, koko, callback) => {
    const url = `https://fi.wikipedia.org/w/api.php?action=query&titles=${haku}&prop=pageimages&format=json&pithumbsize=${koko}`
    request({ uri: url, json: true }, (error, response, body) => {
        if (error) {
            callback("ei yhteyttä darkboxiin", undefined);
        } else if (body.error) {
            callback("Ei oo paikkaa", undefined);
        } else {
            //callback(undefined, body.query.pages[0].extract);
            if(body.query){
                callback(undefined, body.query.pages);
            }
            callback("mun wiki api on baska", undefined);
        }
    })
}
//This is in the wrong module, too lazy to refactor.
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

            //this is code is fucking bad... "temporary" for now.. //TODO
            wikiImage(sName, '400' /*image size*/, (error, data) => {
                if (!error) {
                    const wikiImg = jPath.eval(data, "$..source")

                    const newLintu = new lintu({
                        name: sName,
                        image: wikiImg[0],//parsedWiki.kuva,
                        lahko: parsedWiki.lahko,
                        heimo: parsedWiki.heimo,
                        suku: parsedWiki.suku,
                        laji: parsedWiki.laji,
                        elinvoimaisuus: parsedWiki.status || 'ei tietoa'
                    })

                    newLintu.save()

                    res.status(201).json(newLintu)
                } else {
                    //ööö
                    //res.status(400).json({error: `wikiImage(${sName}) problem.. utf-8 related?`})
                }
            })

            /*
            const newLintu = new lintu({
                name: sName,
                image: myimg,//parsedWiki.kuva,
                lahko: parsedWiki.lahko,
                heimo: parsedWiki.heimo,
                suku: parsedWiki.suku,
                laji: parsedWiki.laji,
                elinvoimaisuus: parsedWiki.status || 'ei tietoa'
            })

            const savedLintu = await newLintu.save()

            res.status(201).json(newLintu)
            */
        }
    } else {
        //if database has entry with name return that entry
        res.status(200).json(nameInDB)
    }

})



module.exports = havaintoRouter