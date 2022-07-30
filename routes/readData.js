const express = require('express')
const router = express.Router()
const abbreviate = require('number-abbreviate');
const verifyUserToken = require('../middleware/verifyUserToken')
const posts = require('../database/schemas/posts');
const replies = require('../database/schemas/replies');
const users = require('../database/schemas/users');


router.get('/post', async (req, res) => {
    const ID = req.query.id;

    if(!ID) {

        return res.status(400).json({success: false, message: "Post id is required.", code: 400})

}

const post = await posts.findOne({_id: ID, type: 'POST'})

if(!post) {

    return res.status(404).json({success: false, message: "Post not found.", code: 404})

}

const post_replies = await replies.find({replied_to: post._id})

const raw_data = {
    _id: post._id,
    user_id: post.user_id,
    title: post.title,
    content: post.content,
    attachment_url: post.attachment_url,
    created_at: post.created_at,
    type: post.type,
    topics: post.topics,
    mentions: post.mentions,
    likes: post.likes,
    replies: post_replies || []
}

const user = await users.findOne({_id: post.user_id})

const posted_at = new Date(post.created_at).toDateString()

const total_likes = abbreviate(post.likes.length, 2)

const processed_data = {

    username: user.username,
    name: user.name,
    avatar_url: user.avatar_url || null,
    created_at: posted_at,
    total_likes: total_likes




}

return res.status(200).json({success: true, message: "Post found.", raw_data, processed_data, code: 200})



})


router.get('/question', async (req, res) => {

    const ID = req.query.id

    
    if(!ID) {

        return res.status(400).json({success: false, message: "Question id is required.", code: 400})

}

const post = await posts.findOne({_id: ID, type: 'QUESTION'})

if(!post) {

    return res.status(404).json({success: false, message: "Question not found.", code: 404})

}

const post_replies = await replies.find({replied_to: post._id})

const raw_data = {
    _id: post._id,
    user_id: post.user_id,
    title: post.title,
    content: post.content,
    attachment_url: post.attachment_url,
    created_at: post.created_at,
    type: post.type,
    topics: post.topics,
    mentions: post.mentions,
    likes: post.likes,
    replies: post_replies || []
}

const user = await users.findOne({_id: post.user_id})

const posted_at = new Date(post.created_at).toDateString()

const total_likes = abbreviate(post.likes.length, 2)

const processed_data = {

    username: user.username,
    name: user.name,
    avatar_url: user.avatar_url || null,
    created_at: posted_at,
    total_likes: total_likes




}

return res.status(200).json({success: true, message: "Question found.", raw_data, processed_data, code: 200})

})


module.exports = router;