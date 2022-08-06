const mongoose = require('mongoose')

const feedback = mongoose.Schema({
    _id: String,
    content: String,
    created_at: Number
})

module.exports = mongoose.model('Feedback', feedback)