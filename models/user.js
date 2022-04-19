const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 4
    },
    passwordHash: {
        type: String,
        required: true
    },
    observations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'havainto'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, retObj) => {
        retObj.id = retObj._id.toString()
        delete retObj._id
        delete retObj._v
        delete retObj.passwordHash
    }
})

module.exports = mongoose.model('user', userSchema)