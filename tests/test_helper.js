const havainto = require('../models/havainto')
const User = require('../models/user')
let timeNow = new Date()

const initialHavaintos = [
    {
        observations: { Kesykyyhky: 7 },
        county: "Kontiolahti",
        location: { Latitude: 23, Longitude: 3 },
        date: timeNow.getTime(),
        user: "625e976a05636ccf65890b9e",
        info: "Torilla näkyi muutamia puluja :D"
    },
    {
        observations: { Varis: 3 },
        county: "Joensuu",
        location: { Latitude: 13, Longitude: 6 },
        date: timeNow.getTime(),
        user: "625e976a05636ccf65890b9e",
        info: "Varis näkyi tuolla oli komia näky"
    }
]

const havainnotDB = async () => {
    const havainnot = havainto.find({})
    return havainnot
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialHavaintos,
    havainnotDB,
    usersInDb
}