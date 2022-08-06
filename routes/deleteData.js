const express = require('express')
const router = express.Router()
const verifyUserToken = require('../middleware/verifyUserToken')
const posts = require('../database/schemas/posts');
const replies = require('../database/schemas/replies');
const users = require('../database/schemas/users');
const feedbacks = require('../database/schemas/feedback')
const bcrypt = require('bcrypt')
const rateLimit = require('express-rate-limit')
const aerect = require('aerect.js')
const sendEmail = require('../functions/sendEmail')

const antispamlimitobject = {
    success: false,
    message: "Too many account deletion requests in a short period of time, please try again in a few minutes.",
    code: 429
}

const antispamauth = rateLimit({
    windowMs: 15000,
    max: 10,
    message: antispamlimitobject
});


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

router.delete('/reply', verifyUserToken, async (req, res) => {
    try {

        const user = req.authorized_account

        const { id } = req.query;

        if (!id) {
            return res.status(404).json({ success: false, message: "Reply not found or you may not be authorized to delete it.", code: 404 })
        }

        const reply = await replies.findOne({ _id: id, user_id: user._id })

        if (!reply) {
            return res.status(404).json({ success: false, message: "Reply not found or you may not be authorized to delete it.", code: 404 })
        }

        await reply.delete()
        return res.status(200).json({ success: true, message: `Successfully deleted the reply.`, code: 200 })

    } catch (e) {
        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }
})

router.delete('/account', antispamauth, verifyUserToken, async (req, res) => {
    try {


        const user = req.authorized_account

        const { password, feedback } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: "Password cannot be empty.", code: 400 })
        }

        const getUser = await users.findOne({ _id: user._id })

        const isPasswordValid = await bcrypt.compare(password, getUser.password)

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Password is incorrect.", code: 400 })
        }

        if (feedback) {

            const f_id = aerect.generateID(11)
            await feedbacks.create({ _id: f_id, content: feedback, created_at: Date.now() })
        }

        const getReplies = await replies.find({ user_id: user._id })
        const getPosts = await posts.find({ user_id: user._id })

        getReplies.forEach(async gr => {
            await gr.delete()
        })

        getPosts.forEach(async gp => {
            await gp.delete()
        })

        await getUser.delete()

        await sendEmail(`Hi ${user.name} \n\nWe are extremely sad to see that you leave Curiopost. If you dropped some feedback before you delete your account, we would read it and try to fix the mistake immediately. If you did not add any feedback you can always drop us a tweet(@curiopost) and we will try to fix it as soon as possible. Keep in mind that you can always register again at: https://curiopost.live/register .\n\nThanks - The Curiopost Team.`, "Curiopost - Account has been deleted.", user.email)

        return res.status(200).json({ success: true, message: "Account has been deleted, might take a few more seconds for our servers to delete your data completely.", code: 200 })



    } catch (e) {
        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }
})

module.exports = router;