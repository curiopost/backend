const mongoose = require('mongoose');

const replies = mongoose.Schema({
    _id: String,
    user_id: String,
    replied_to: String,
    content: String,
    attachment_url: String,
    created_at: Number,
    likes: Array,
    topics: Array,
    mentions: Array
});

module.exports = mongoose.model('Replies', replies);

