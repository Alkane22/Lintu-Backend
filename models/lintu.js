const mongoose =  require('mongoose')

const lintuSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    lahko: {
        type: String,
        required: true
    },
    heimo: {
        type: String,
        required: true
    },
    suku: {
        type: String,
        required: true
    },
    laji: {
        type: String,
        required: true
    },
    elinvoimaisuus: {
        type: String,
        required: true
    }
})

lintuSchema.set('toJSON', {
    transform: (document, retObj) => {
        retObj.id = retObj._id.toString()
        delete retObj._id
    }
})

module.exports = mongoose.model('lintu', lintuSchema)