const mongoose = require('mongoose');

const users = mongoose.Schema({
    _id: String,
    username: String,
    name: String,
    email: String,
   password: String,
   verified: Boolean,
    created_at: Number,
    following: Array,
    followers: Array,
    interests: Array,
    avatar_url: String,
    bio: String,
    location: String,
    website: String,
    likes: Array,
});

module.exports = mongoose.model('Users', users);