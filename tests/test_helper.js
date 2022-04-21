const havainto = require('../models/havainto')
const User = require('../models/user')
let timeNow = new Date()

const initialHavaintos = [
    {
        observations: { Varis: 7 },
        county: "Kontiolahti",
        location: { Latitude: 23, Longitude: 3 },
        date: timeNow.getTime(),
        user: "625e976a05636ccf65890b9e",
        info: "Torilla näkyi muutamia variksia :D"
    },
    {
        observations: { Fasaani: 3 },
        county: "Joensuu",
        location: { Latitude: 13, Longitude: 6 },
        date: timeNow.getTime(),
        user: "625e976a05636ccf65890b9e",
        info: "Fasaani näkyi tuolla oli komia näky"
    },
    {
        observations: { Harakka: 1 },
        county: "Kuopio",
        location: { Latitude: 6, Longitude: 2 },
        date: timeNow.getTime(),
        user: "625e976a05636ccf65890b9e",
        info: "Spottasin Harakan"
    }
]

const birdnames = [
    "Fasaani",
    "Harmaapäätikka",
    "Käpytikka",
    "Mustarastas",
    "Hömötiainen",
    "Töyhtötiainen",
    "Kuusitiainen",
    "Närhi",
    "Sinitiainen",
    "Talitiainen",
    "Harakka",
    "Naakka",
    "Varis",
    "Varpunen",
    "Pikkuvarpunen",
    "Viherpeippo",
    "Urpiainen",
    "Punatulkku",
    "Keltasirkku"
]

const havainnotDB = async () => {
    const havainnot = await havainto.find({})
    return havainnot.map(h => h.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    birdnames,
    initialHavaintos,
    havainnotDB,
    usersInDb
}