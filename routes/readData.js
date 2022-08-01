const express = require('express')
const router = express.Router()
const abbreviate = require('number-abbreviate');
const verifyUserToken = require('../middleware/verifyUserToken')
const posts = require('../database/schemas/posts');
const replies = require('../database/schemas/replies');
const users = require('../database/schemas/users');


router.get('/post', async (req, res) => {

    try {

    const ID = req.query.id;

    if (!ID) {

        return res.status(400).json({ success: false, message: "Post id is required.", code: 400 })

    }

    const post = await posts.findOne({ _id: ID, type: 'POST' })

    if (!post) {

        return res.status(404).json({ success: false, message: "Post not found.", code: 404 })

    }

    const post_replies = await replies.find({ replied_to: post._id })

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

    const user = await users.findOne({ _id: post.user_id })

    const posted_at = new Date(post.created_at).toDateString()

    const total_likes = abbreviate(post.likes.length, 2)

    const processed_data = {

        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url || null,
        created_at: posted_at,
        total_likes: total_likes




    }

    return res.status(200).json({ success: true, message: "Post found.", raw_data, processed_data, code: 200 })

} catch(e) {

    console.error(e)

    return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
}



})


router.get('/question', async (req, res) => {

    try {

    const ID = req.query.id


    if (!ID) {

        return res.status(400).json({ success: false, message: "Question id is required.", code: 400 })

    }

    const post = await posts.findOne({ _id: ID, type: 'QUESTION' })

    if (!post) {

        return res.status(404).json({ success: false, message: "Question not found.", code: 404 })

    }

    const post_replies = await replies.find({ replied_to: post._id })

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

    const user = await users.findOne({ _id: post.user_id })

    const posted_at = new Date(post.created_at).toDateString()

    const total_likes = abbreviate(post.likes.length, 2)

    const processed_data = {

        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url || null,
        created_at: posted_at,
        total_likes: total_likes




    }

    return res.status(200).json({ success: true, message: "Question found.", raw_data, processed_data, code: 200 })

} catch(e) {

    console.error(e)

    return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
}

})

router.get('/replies', async (req, res) => {

    try {

    const post_id = req.query.post_id;

    if (!post_id) {
        return res.status(400).json({ success: false, message: "Post id is required.", code: 400 })

    }

    const total_replies = await replies.find({ replied_to: post_id })
    

    var raw_data = []
    var processed_data = []

   for (const r of total_replies) {

           

        const raw_object = {
            _id: r._id,
            user_id: r.user_id,
            replied_to: r.replied_to,
            content: r.content,
            likes: r.likes,
            topics: r.topics,
            mentions: r.mentions,
            created_at: r.created_at,
            attachment_url: r.attachment_url

        }

        const user = await users.findOne({ _id: r.user_id })

        const replied_at = new Date(r.created_at).toDateString()

        const total_likes = abbreviate(r.likes.length, 2)

    

        const processed_object = {
            _id: r._id,
            username: user.username,
            name: user.name,
            avatar_url: user.avatar_url || null,
            created_at: replied_at,
            total_likes: total_likes,
          
}

raw_data.push(raw_object)
processed_data.push(processed_object)

}


const total_replies_length = abbreviate(total_replies.length, 2)

    return res.status(200).json({success: true, message: "Replies found.", raw_data: raw_data, processed_data: processed_data, total_replies: total_replies_length, code: 200})

} catch(e) {

    console.error(e)

    return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
}
})

router.get('/reply', async (req, res) => {

    try {

    const ID = req.query.id
    if(!ID) {
        return res.status(400).json({success: false, message: "Reply id is required", code: 400})
    }

   const reply = await replies.findOne({_id: ID})

   if(!reply) {
    return res.status(404).json({success: false, message: "No reply found according to the provided id.", code: 404})
   }

   const post = await posts.findOne({_id: reply.replied_to})
   if(!post) {
    return res.status(404).json({success: false, message: "No reply found according to the provided id.", code: 404})
   }
const user = await users.findOne({_id: reply.user_id})
if(!user) {
    return res.status(404).json({success: false, message: "No reply found according to the provided id.", code: 404})
}

const raw_data = {
_id: reply._id,
user_id: reply.user_id,
replied_to: reply.replied_to,
content: reply.content,
attachment_url: reply.attachment_url,
created_at: reply.created_at,
likes: reply.likes,
topics: reply.topics,
mentions:reply.mentions

}


const total_likes = abbreviate(reply.likes.length, 2)
const replied_at = new Date(reply.created_at).toDateString()
const processed_data = {
    username: user.username,
    name: user.name,
    replied_title: post.title,
    avatar_url: user.avatar_url,
    total_likes: total_likes,
    created_at: replied_at


}

return res.status(200).json({success: true, message: "Reply Found", raw_data, processed_data, code: 200})

} catch(e) {

    console.error(e)

    return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
}


})


module.exports = router;