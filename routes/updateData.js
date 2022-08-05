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


router.patch('/unlike', verifyUserToken, async (req, res) => {

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

if(!post.likes.includes(user._id)) {
   return res.status(400).json({success: false, message: "You have not liked this post.", code: 400})
}

var new_post_likes = post.likes.filter(i => i !== user._id)
post.likes = new_post_likes
await post.save()

const unLiker = await users.findOne({_id: user._id})

var new_user_likes = unLiker.likes.filter(i => i !== post._id)
unLiker.likes = new_user_likes
await unLiker.save()

const new_post_data = await posts.findOne({_id: id})

const newPostLikes = abbreviate(new_post_data.likes.length, 2)
return res.status(200).json({success: true, message: "Successfully unliked post", likes: newPostLikes, code: 200})
   } else if(type === "reply") {

      const reply = await replies.findOne({_id: id})
      if(!reply) {
         return res.status(404).json({success: false, message: "Reply not found.", code: 404})
   }

   if(!reply.likes.includes(user._id)) {
      return res.status(400).json({success: false, message: "You have not liked this reply.", code: 400})
   }

   var new_reply_likes = reply.likes.filter(i => i !== user._id)
   reply.likes = new_reply_likes
   await reply.save()

   const replyUnliker = await users.findOne({_id: user._id})

   var newUnlikerLikes = replyUnliker.likes.filter(i => i !== reply._id)

   replyUnliker.likes = newUnlikerLikes
   await replyUnliker.save()

   const new_reply_data = await replies.findOne({_id: id})
const newReplyLikes = abbreviate(new_reply_data.likes.length, 2)
return res.status(200).json({success: true, message: "Successfully unliked reply.", likes: newReplyLikes, code: 200})
   } else {
      return res.status(400).json({success: false, message: "Invalid type.", code: 400})
   } 


   } catch(e) {
      console.error(e)
   
    return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
   }
})


router.patch('/post', verifyUserToken, async (req, res) => {

   try {

   const user = req.authorized_account

const {id} = req.query;

let {title, content, topics} = req.body;

if(!id) {
   return res.status(404).json({success: false, message: "Post or question not found or you may not be authorized to update it.", code: 404})
}

if(!title) {
   return res.status(400).json({success: false, message: "Title cannot be empty.", code: 400})
}

if(!content) {
   return res.status(400).json({success: false, message: "Content cannot be empty.", code: 400})
}

if(topics && !Array.isArray(topics)) {
   return res.status(400).json({success: false, message: "Topics must be an array.", code: 400})
}

if(!topics) {
   topics = []
}

const post = await posts.findOne({_id: id, user_id: user._id})

if(!post) {
   return res.status(404).json({success: false, message: "Post or question not found or you may not be authorized to update it.", code: 404})  
}

post.title = title
post.content = content
post.topics = topics || []

await post.save()

const newPostData = await posts.findOne({_id: id, user_id: user.id})

return res.status(200).json({success: true, message: `Successfully updated ${newPostData.type.toLowerCase()} data.`, data: newPostData, code: 200})

} catch(e) {
   console.error(e)

 return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
}

})


router.patch('/reply', verifyUserToken, async (req, res) => {

   try {
const user = req.authorized_account;

const {id} = req.query;
let {topics, content} = req.body;

if(!id) {
   return res.status(404).json({success: false, message: "Reply not found or you may not be authorized to update it.", code: 404})
}

if(!content) {
   return res.status(400).json({success: false, message: "Content cannot be empty.", code: 400})
}

if(topics && !Array.isArray(topics)) {
   return res.status(400).json({success: false, message: "Topics must be an array.", code: 400})
}
if(!topics) {
   topics = []
}

const reply = await replies.findOne({_id: id, user_id: user._id})

if(!reply) {
   return res.status(404).json({success: false, message: "Reply not found or you may not be authorized to update it.", code: 404})   
}

reply.content = content
reply.topics = topics || []
await reply.save()

const newReplyData = await replies.findOne({_id: id, user_id: user._id})

return res.status(200).json({success: true, message: "Successfully updated reply data.", data: newReplyData, code: 200})

   } catch(e) {
      console.error(e)
   
    return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
   }
})

router.patch('/user', verifyUserToken, async (req, res) => {

   try {

   const user = req.authorized_account;
   let {username, name, bio, location, website} = req.body;

   if(!username) {
      return res.status(400).json({success: false, message: "Username cannot be empty.", code: 400})
   }
   if(!name) {
      return res.status(400).json({success: false, message: "Name cannot be empty.", code: 400})
   }
if(username !== user.username) {
   
   const isUsernameAvailabe = await users.findOne({username: username})
   if(isUsernameAvailabe) {
      return res.status(400).json({success: false, message: "Sorry this username is unavailable.", code: 400})
   }
}

const UpdatedUser = await users.findOne({_id: user._id})

UpdatedUser.username = username;
UpdatedUser.name = name;
UpdatedUser.bio = bio || null,
UpdatedUser.location = location || null,
UpdatedUser.website = website || null

await UpdatedUser.save()

const getUpdatedUserData = await users.findOne({_id: user._id}).select('-password').select('-pid').select('-interests')

return res.status(200).json({success: true, message: "Successfully updated user data.", data: getUpdatedUserData, code: 200})

} catch(e) {
   console.error(e)

 return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
}

})


module.exports = router;