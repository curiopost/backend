const express = require('express')
const router = express.Router()
const verifyUserToken = require('../middleware/verifyUserToken')
const posts = require('../database/schemas/posts');
const replies = require('../database/schemas/replies');
const users = require('../database/schemas/users');

router.patch('/follow', verifyUserToken, async(req, res) => {

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

   


})


module.exports = router;