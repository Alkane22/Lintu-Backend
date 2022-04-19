const havaintoRouter = require('express').Router()
const havainto = require('../models/havainto')
const User = require('../models/user')
const mongoose = require('mongoose')

let today = new Date()

havaintoRouter.get('/', async (req, res) => {
    const havainnot = await havainto.find({})
    res.json(havainnot)
})

havaintoRouter.get('/:id', async (req, res) => {
    try{
        const havainnot = await havainto.findById(req.params.id)
        if (havainnot) {
            res.status(200).json(havainnot)
        } else {
            //if id was not found from database
            res.status(404).json({error: 'id not found'})
        }
    } catch (e) {
        //mongoose id lenght min 12
        res.status(400).json({error: 'id has wrong format'})
    }
})

havaintoRouter.post('/', async (req, res) => {
    const body = req.body
    const timeNow = today.getTime()

    const useri = await User.findById(req.user.id)

    try{
        const newHavainto = new havainto({
            observations: body.observations,
            date: timeNow,
            county: body.county || 'Empty',
            location: body.location,
            user: useri._id,
            info: body.info || 'Empty'
        })

        const savedHavainto = await newHavainto.save()
        res.status(201).json(savedHavainto)

    } catch(e){
        res.status(400).json({'error' : e.name})
    }

})

havaintoRouter.delete('/:id', async (req, res) => {
    try{
        const dbres = await havainto.deleteOne({ '_id': mongoose.Types.ObjectId(req.params.id) })
        if(dbres.deletedCount !== 0){
            res.status(200).end()
        } else {
            //if id was not in db the db responds with {...deletedCount: 0 }
            res.status(404).json({error: 'id not found'})
        }
    } catch (e){
        //mongoose id lenght min 12
        res.status(400).json({error: 'id has wrong format'})
    }
})

module.exports = havaintoRouter