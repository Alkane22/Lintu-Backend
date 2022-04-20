const mongoose = require('mongoose')

const havaintoSchema = mongoose.Schema({
    //observations: { 'Varis': 10 },
    //i have to add a max length to object array or funny(not) stuff might happen //TODO
    observations: {
        type: Object,
        required: true
    },
    //date: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
    date: {
        type: String,
        required: true
    },
    //county: 'Kontiolahti',
    county: {
        type: String,
        required: false
    },
    //location: { 'Latitude': 9, 'Longitude': 18 },
    location: {
        type: Object,
        required: true
    },
    //user: 'userObjID1',
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    //info: 'Näin 10 varista, oli komia näky'
    info: {
        type: String,
        required: false
    }
})

havaintoSchema.set('toJSON', {
    transform: (document, retObj) => {
        retObj.id = retObj._id.toString()
        delete retObj._id
        delete retObj.__v
    }
})

module.exports = mongoose.model('havainto', havaintoSchema)