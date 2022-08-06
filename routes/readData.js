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

    } catch (e) {

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

    } catch (e) {

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

        return res.status(200).json({ success: true, message: "Replies found.", raw_data: raw_data, processed_data: processed_data, total_replies: total_replies_length, code: 200 })

    } catch (e) {

        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }
})

router.get('/reply', async (req, res) => {

    try {

        const ID = req.query.id
        if (!ID) {
            return res.status(400).json({ success: false, message: "Reply id is required", code: 400 })
        }

        const reply = await replies.findOne({ _id: ID })

        if (!reply) {
            return res.status(404).json({ success: false, message: "No reply found according to the provided id.", code: 404 })
        }

        const post = await posts.findOne({ _id: reply.replied_to })
        if (!post) {
            return res.status(404).json({ success: false, message: "No reply found according to the provided id.", code: 404 })
        }
        const user = await users.findOne({ _id: reply.user_id })
        if (!user) {
            return res.status(404).json({ success: false, message: "No reply found according to the provided id.", code: 404 })
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
            mentions: reply.mentions

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

        return res.status(200).json({ success: true, message: "Reply Found.", raw_data, processed_data, code: 200 })

    } catch (e) {

        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }


})

router.get('/user', async (req, res) => {
    try {

        let { username } = req.query;
        if (!username) {
            return res.status(404).json({ success: false, message: "User not found.", code: 404 })
        }

        const user = await users.findOne({ username: username }).select('-password').select('-pid').select('-interests').select('-verified').select('-notifications').select('-email')
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found.", code: 404 })
        }

        const raw_data = user
        const uposts = await posts.find({ user_id: user._id })
        const totalFolowers = abbreviate(user.followers.length, 2)
        const totalFollowing = abbreviate(user.following.length, 2)
        const totalLikes = abbreviate(user.likes.length, 2)
        const totalPosts = abbreviate(uposts.length, 2)
        const creationDate = new Date(user.created_at).toDateString()

        const processed_data = {
            _id: user._id,
            total_followers: totalFolowers,
            total_following: totalFollowing,
            total_likes: totalLikes,
            total_posts: totalPosts,
            creation_date: creationDate

        }

        const user_posts = []

        for (const p of uposts) {

            const postCreationDate = new Date(p.created_at).toDateString()
            const postLikes = abbreviate(p.likes.length, 2)

            const post_object = {
                _id: p._id,
                user_id: p.user_id,
                title: p.title,
                content: p.content,
                attachment_url: p.attachment_url,
                created_at: p.created_at,
                type: p.type,
                topics: p.topics,
                mentions: p.mentions,
                creation_date: postCreationDate,
                likes: postLikes

            }

            user_posts.push(post_object)

        }

        return res.status(200).json({ success: true, message: "User found.", raw_data, processed_data, user_posts, code: 200 })

    } catch (e) {

        console.error(e)
        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }
})

router.get('/search', async (req, res) => {

    try {

        const { q } = req.query;

        if (!q) {
            return res.status(404).json({ success: false, message: "No results found.", code: 404 })
        }

        const searchUser = await users.find().select('-password').select('-pid').select('-interests').select('-verified').select('-notifications').select('-email')

        const searchPost = await posts.find()

        const getValidUsersFoundByName = searchUser.filter(i => i.name.includes(q))
        const getValidUsersFoundByUserName = searchUser.filter(i => i.username.includes(q))

        const user_results = []
        let Userblacklist = []

        for (const r of getValidUsersFoundByName) {

            user_results.push(r)
            Userblacklist.push(r._id)
        }

        for (const us of getValidUsersFoundByUserName) {
            if (Userblacklist.includes(us._id)) break;

            user_results.push(us)

        }

        let Postblacklist = []
        const post_results = []

        const getValidPostsByTitle = searchPost.filter(i => i.title.includes(q))
        const getValidPostsByContent = searchPost.filter(i => i.content.includes(q))
        const getValidPostByTopics = searchPost.filter(i => i.topics.includes(q))

        for (const pt of getValidPostsByTitle) {
            const getPoster = await users.findOne({ _id: pt.user_id })
            const pt_likes = abbreviate(pt.likes.length, 2)
            const pt_created = new Date(pt.created_at).toDateString()

            const post_object = {
                _id: pt._id,
                user_id: getPoster.user_id,
                username: getPoster.username,
                name: pt.name,
                avatar_url: getPoster.avatar_url,
                created_at: pt.created_at,
                type: pt.type,
                content: pt.content,
                title: pt.title,
                attachment_url: pt.attachment_url,
                mentions: pt.mentions,
                likes: pt.likes,
                total_likes: pt_likes,
                created_date: pt_created,
                topics: pt.topics
            }

            post_results.push(post_object)

            Postblacklist.push(pt._id)

        }

        for (const pt of getValidPostsByContent) {
            if (Postblacklist.includes(pt._id)) break;

            const getPoster = await users.findOne({ _id: pt.user_id })
            const pt_likes = abbreviate(pt.likes.length, 2)
            const pt_created = new Date(pt.created_at).toDateString()

            const post_object = {
                _id: pt._id,
                user_id: getPoster.user_id,
                username: getPoster.username,
                name: pt.name,
                avatar_url: getPoster.avatar_url,
                created_at: pt.created_at,
                type: pt.type,
                content: pt.content,
                title: pt.title,
                attachment_url: pt.attachment_url,
                mentions: pt.mentions,
                likes: pt.likes,
                total_likes: pt_likes,
                created_date: pt_created,
                topics: pt.topics
            }

            post_results.push(post_object)

            Postblacklist.push(pt._id)

        }

        for (const pt of getValidPostByTopics) {
            if (Postblacklist.includes(pt._id)) break;

            const getPoster = await users.findOne({ _id: pt.user_id })
            const pt_likes = abbreviate(pt.likes.length, 2)
            const pt_created = new Date(pt.created_at).toDateString()

            const post_object = {
                _id: pt._id,
                user_id: getPoster.user_id,
                username: getPoster.username,
                name: pt.name,
                avatar_url: getPoster.avatar_url,
                created_at: pt.created_at,
                type: pt.type,
                content: pt.content,
                title: pt.title,
                attachment_url: pt.attachment_url,
                mentions: pt.mentions,
                likes: pt.likes,
                total_likes: pt_likes,
                created_date: pt_created,
                topics: pt.topics
            }

            post_results.push(post_object)

            Postblacklist.push(pt._id)

        }


        return res.status(200).json({ success: true, message: "Results found.", users: user_results, posts: post_results, code: 200 })

    } catch (e) {

        console.error(e)
        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }

})

router.get('/topics', async (req, res) => {

    try {

        const { topic } = req.query;

        if (!topic) {
            return res.status(400).json({ success: false, message: "Tag is required.", code: 400 })
        }

        const Getposts = await posts.find()

        const Tagposts = Getposts.filter(i => i.topics.includes(topic))

        const results = []

        for (const pt of Tagposts) {
            const getPoster = await users.findOne({ _id: pt.user_id })
            const pt_likes = abbreviate(pt.likes.length, 2)
            const pt_created = new Date(pt.created_at).toDateString()

            const post_object = {
                _id: pt._id,
                user_id: getPoster.user_id,
                username: getPoster.username,
                name: pt.name,
                avatar_url: getPoster.avatar_url,
                created_at: pt.created_at,
                type: pt.type,
                content: pt.content,
                title: pt.title,
                attachment_url: pt.attachment_url,
                mentions: pt.mentions,
                likes: pt.likes,
                total_likes: pt_likes,
                created_date: pt_created,
                topics: pt.topics
            }

            results.push(post_object)
        }

        return res.status(200).json({ success: true, message: "Topic found.", posts: results, code: 200 })

    } catch (e) {

        console.error(e)
        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }



})

router.get('/feeds', verifyUserToken, async (req, res) => {

    try {
        const user = req.authorized_account

        const getPosts = await posts.find()

        const filterByinterests = getPosts.filter(i => i.topics.some(topic => user.interests.includes(topic)))
        const alreadySent = []
        const feeds = []

        for (const pt of filterByinterests) {

            const getPoster = await users.findOne({ _id: pt.user_id })
            const pt_likes = abbreviate(pt.likes.length, 2)
            const pt_created = new Date(pt.created_at).toDateString()

            const post_object = {
                _id: pt._id,
                user_id: getPoster.user_id,
                username: getPoster.username,
                name: pt.name,
                avatar_url: getPoster.avatar_url,
                created_at: pt.created_at,
                type: pt.type,
                content: pt.content,
                title: pt.title,
                attachment_url: pt.attachment_url,
                mentions: pt.mentions,
                likes: pt.likes,
                total_likes: pt_likes,
                created_date: pt_created,
                topics: pt.topics
            }


            feeds.push(post_object)
            alreadySent.push(pt._id)

        }
        const followerPosts = []
        for (const following of user.following) {

            const afollowerspost = await posts.find({ user_id: following })

            followerPosts.push(afollowerspost)


        }

        for (const pt of followerPosts) {

            if (alreadySent.includes(pt._id)) break;

            const getPoster = await users.findOne({ _id: pt.user_id })
            const pt_likes = abbreviate(pt.likes.length, 2)
            const pt_created = new Date(pt.created_at).toDateString()

            const post_object = {
                _id: pt._id,
                user_id: getPoster.user_id,
                username: getPoster.username,
                name: pt.name,
                avatar_url: getPoster.avatar_url,
                created_at: pt.created_at,
                type: pt.type,
                content: pt.content,
                title: pt.title,
                attachment_url: pt.attachment_url,
                mentions: pt.mentions,
                likes: pt.likes,
                total_likes: pt_likes,
                created_date: pt_created,
                topics: pt.topics
            }


            feeds.push(post_object)
            alreadySent.push(pt._id)
        }

        const recommendations = []

        const sortGetPosts = getPosts.sort((a, b) => (a.likes.length < b.likes.length ? 1 : -1)).filter(i => i.likes.length > 0)

        for (const pt of sortGetPosts) {

            if (alreadySent.includes(pt._id)) break;

            const getPoster = await users.findOne({ _id: pt.user_id })
            const pt_likes = abbreviate(pt.likes.length, 2)
            const pt_created = new Date(pt.created_at).toDateString()

            const post_object = {
                _id: pt._id,
                user_id: getPoster.user_id,
                username: getPoster.username,
                name: pt.name,
                avatar_url: getPoster.avatar_url,
                created_at: pt.created_at,
                type: pt.type,
                content: pt.content,
                title: pt.title,
                attachment_url: pt.attachment_url,
                mentions: pt.mentions,
                likes: pt.likes,
                total_likes: pt_likes,
                created_date: pt_created,
                topics: pt.topics
            }

            recommendations.push(post_object)
            alreadySent.push(pt._id)

        }

        return res.status(200).json({ success: true, message: "Here's your feeds.", feeds, recommendations, topics: user.interests, code: 200 })

    } catch (e) {

        console.error(e)
        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }


})


module.exports = router;