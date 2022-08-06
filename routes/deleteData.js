const express = require('express')
const router = express.Router()
const verifyUserToken = require('../middleware/verifyUserToken')
const posts = require('../database/schemas/posts');
const replies = require('../database/schemas/replies');
const users = require('../database/schemas/users');

router.delete('/post', verifyUserToken, async (req, res) => {

    try {

        const user = req.authorized_account

        const { id } = req.query;

        if (!id) {
            return res.status(404).json({ success: false, message: "Post or question not found or you may not be authorized to delete it.", code: 404 })
        }

        const post = await posts.findOne({ _id: id, user_id: user._id })

        if (!post) {
            return res.status(404).json({ success: false, message: "Post or question not found or you may not be authorized to delete it.", code: 404 })
        }

        await post.delete()
        const findPostReplies = await replies.find({ replied_to: id })
        findPostReplies.forEach(async r => {
            await r.delete()
        })
        return res.status(200).json({ success: true, message: `Successfully deleted the ${post.type.toLowerCase()}, it might take a few more seconds for our servers to delete all of its replies.`, code: 200 })


    } catch (e) {
        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }


})

module.exports = router;