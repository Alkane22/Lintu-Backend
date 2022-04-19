const havaintoRouter = require('express').Router()

let today = new Date()

let havaintoDB = {
    '1': {
        observations:{'Varis': 10},
        date: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
        county: 'Kontiolahti',
        location: {'Latitude': 9, 'Longitude': 18},
        user: 'userObjID1',
        info: 'Näin 10 varista, oli komia näky'
    },
    '2': {
        observations:{'Kesykyyhky': 5},
        date: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
        county: 'Helsinki',
        location: {'Latitude': 3, 'Longitude': 6},
        user: 'userObjID2',
        info: 'Torilla näkyi muutamana pulu :D'
    }
}

havaintoRouter.get('/', (req, res) => {
    res.json(havaintoDB)
})

havaintoRouter.get('/:id', (req, res) => {
    console.log('okasdoasodkoaskd')
    res.json(havaintoDB[req.params.id])
})

module.exports = havaintoRouter