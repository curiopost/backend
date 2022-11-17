const mongoose = require('mongoose')

const otps = mongoose.Schema({
    _id: String,
    user_id: String,
    otp: Number,
    expires_at: Number,
    failed_attempts: Number
})

module.exports = mongoose.model('Otps', otps)