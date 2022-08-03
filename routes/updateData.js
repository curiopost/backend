const express = require('express')
const router = express.Router()
const verifyUserToken = require('../middleware/verifyUserToken')
const posts = require('../database/schemas/posts');
const replies = require('../database/schemas/replies');
const users = require('../database/schemas/users');
const abbreviate = require('number-abbreviate')

router.patch('/follow', verifyUserToken, async(req, res) => {

   try {

    const user = req.authorized_account;
    const tofollow = req.query.username

   const userToFollow = await users.findOne({username: tofollow})

   if(!userToFollow) {
return res.status(404).json({success: false, message: "User not found.", code: 404})

   }

   if(user.following.includes(userToFollow._id)) {
return res.status(400).json({success: false, message: "User is already followed by you.", code: 400})

   }

   if(user._id === userToFollow._id) {
    return res.status(400).json({success: false, message: "You may not follow yourself.", code: 400})

   }

   userToFollow.followers.push(user._id)
   await userToFollow.save()

   const follower = await users.findOne({_id: user._id})
   follower.following.push(userToFollow._id)

   await follower.save()

   return res.status(200).json({success: true, message: `Successfully followed ${userToFollow.name}.`, code: 200})
} catch(e) {
   console.error(e)

 return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
}
})

router.patch('/unfollow', verifyUserToken, async (req, res) => {

   try {

const user = req.authorized_account;
const toUnFollow = req.query.username;

const userToUnfollow = await users.findOne({username: toUnFollow})

if(!userToUnfollow) {
   return res.status(404).json({success: false, message: "User not found.", code: 404})
}

if(!user.following.includes(userToUnfollow._id)) {
   return res.status(400).json({success: false, message: "You haven't followed this user to unfollow.", code: 400})
}

var newfollowers = userToUnfollow.followers.filter(i => i !== user._id)
userToUnfollow.followers = newfollowers
await userToUnfollow.save()

const unfollower = await users.findOne({_id: user._id})
var newfollowing = unfollower.following.filter(i => i !== userToUnfollow._id)

unfollower.following = newfollowing
await unfollower.save()

return res.status(200).json({success: true, message: `Successfully unfollowed ${userToUnfollow.name}.`, code: 200})


} catch(e) { 
   
   console.error(e)

   return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 }) }
})

router.patch('/like', verifyUserToken,async (req, res) => {
try {
let {id, type} = req.query
const user =  req.authorized_account

if(!type) {
   type = "post"
}
if(!id) {
   return res.status(404).json({success: false, message: "Post or reply not found.", code: 404})
}
if(type === "post") {
const post = await posts.findOne({_id: id})

if(!post) {
   return res.status(404).json({success: false, message: "Post not found.", code: 404})
}

if(user.likes.includes(post._id)) {

   return res.status(400).json({success: false, message: "You have already liked this post.", code: 400})
}

post.likes.push(user._id)
await post.save()
const liker = await users.findOne({_id: user._id})
liker.likes.push(post._id)


for (const ti of post.topics) {
 
   liker.interests.push(ti)
}

await liker.save()

const new_post_likes = await posts.findOne({_id: id})
const total_likes = abbreviate(new_post_likes.likes.length, 2)

return res.status(200).json({success: true, message: "Post successfully liked.", likes: total_likes, code: 200})

} else if(type === "reply") {

   const reply = await replies.findOne({_id: id})

   if(!reply) {
      return res.status(404).json({success: false, message: "Reply not found.", code: 404})
   }
   if(user.likes.includes(reply._id)) {
      return res.status(400).json({success: false, message: "You have already liked this reply.", code: 400})
   }

   reply.likes.push(user._id)
   await reply.save()
   const replyLiker = await users.findOne({_id: user._id})
   replyLiker.likes.push(reply._id)

   for (const r of reply.topics) {
      replyLiker.interests.push(r)
   }

   await replyLiker.save()

   
  

   const new_reply_likes = await replies.findOne({_id: id})
   const total_reply_likes = abbreviate(new_reply_likes.likes.length, 2)

   return res.status(200).json({success: true, message: "Reply successfully liked.", likes: total_reply_likes, code: 200})

} else {
   return res.status(400).json({success: false, message: "Invalid type.", code: 400})
}
} catch(e) {
   console.error(e)

 return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
}


})




module.exports = router;