const mongoose = require('mongoose');

const posts = mongoose.Schema({
    _id: String,
    user_id: String,
    title: String,
    content: String,
    attachment_url: String,
    created_at: Number,
    type: String, // 'POST' or 'QUESTION'
    topics: Array,
    mentions: Array,
    likes: Array
    

})

module.exports = mongoose.model('Posts', posts);