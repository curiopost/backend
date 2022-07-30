const express = require('express')
const router = express.Router()
const aerect = require('aerect.js');
const verifyUserToken = require('../middleware/verifyUserToken');
const posts = require('../database/schemas/posts');
const replies = require('../database/schemas/replies');
const abbreviate = require('number-abbreviate');
const users = require('../database/schemas/users');

router.post('/post', verifyUserToken, async (req, res) => {

const user =  req.authorized_account;
try {
    const ID = aerect.generateID(11)

let {title, content, attachment_url, topics, mentions } = req.body;



var likes = []

var type = "POST"

if(!title) {

return res.status(400).json({success: false, message: "Title is required.", code: 400})

}

if(!content) {

    return res.status(400).json({success: false, message: "Content is required.", code: 400})

}

if(attachment_url && !attachment_url.toLowerCase().startsWith("https://res.cloudinary")) {

return res.status(400).json({success: false, message: "Attachment URL must be from cloudinary.", code: 400})

}

if(mentions && !Array.isArray(mentions)) {

return res.status(400).json({success: false, message: "Mentions must be an array.", code: 400})

}

if(topics && !Array.isArray(topics)) {

    return res.status(400).json({success: false, message: "Topics must be an array.", code: 400})


}


if(!mentions) {
    mentions = []
}

if(!topics) {
    topics = []
}


user.followers.forEach(u => {

    users.findOne({_id: u}, async (err, data) => {

        if(!data) return;

        const notification_object = {
          type: 'following_user_post_create',
          created_at: Date.now(),
          title: title,
          url: `/posts/${ID}`,
          reason: `${req.authorized_account.name} posted a new post.`,
          type: type

        }

        data.notifications.push(notification_object)
        await data.save()
    })
})

    mentions.forEach(m => {

users.findOne({username: m}, async (err, data) => {

if(!data) return;
const notification_object = {
    type: 'user_mention_you_in_post',
    created_at: Date.now(),
    title: title,
    url: `/posts/${ID}`,
    reason: `${req.authorized_account.name} mentioned you in a new post.`,
    type: type

  }

  data.notifications.push(notification_object)
await data.save()



})

    })
    
  

    const post_object = {
        _id: ID,
        user_id: req.authorized_account._id,
        title: title,
        content: content,
        attachment_url: attachment_url || null,
        created_at: Date.now(),
        type: type,
        mentions: mentions || [],
        topics: topics || [],
        likes: likes
    }

    await posts.create(post_object)

    return res.status(201).json({success: true, message: "Post successfully created.", url: `/posts/${ID}`, code: 200})

} catch(e) {
    console.error(e)

    return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
}

})

module.exports = router;