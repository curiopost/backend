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


        for (const r of total_replies) {
            const user = await users.findOne({ _id: r.user_id })

            const replied_at = new Date(r.created_at).toDateString()

            const total_likes = abbreviate(r.likes.length, 2)


            const raw_object = {
                _id: r._id,
                user_id: r.user_id,
                username: user.username,
                name: user.name,
                avatar_url: user.avatar_url || null,
                replied_to: r.replied_to,
                content: r.content,
                likes: r.likes,
                total_likes: total_likes,
                topics: r.topics,
                mentions: r.mentions,
                created_at: r.created_at,
                created_date: replied_at,
                attachment_url: r.attachment_url

            }






            raw_data.push(raw_object)


        }


        const total_replies_length = abbreviate(total_replies.length, 2)

        return res.status(200).json({ success: true, message: "Replies found.", data: raw_data, total_replies: total_replies_length, code: 200 })

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
                likes: postLikes,
                users_likes: p.likes

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

        const searchUser = await users.find({censored: false || undefined}).select('-password').select('-pid').select('-interests').select('-verified').select('-notifications').select('-email')

        const searchPost = await posts.find({censored: false || undefined})

        const getValidUsersFoundByName = searchUser.filter(i => i.name.includes(q))
        const getValidUsersFoundByUserName = searchUser.filter(i => i.username.includes(q))

        const user_results = []
        let Userblacklist = []

        for (const r of getValidUsersFoundByName) {

            user_results.push(r)
            Userblacklist.push(r._id)
        }

        for (const us of getValidUsersFoundByUserName) {
            if (Userblacklist.includes(us._id)) continue;

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
                name: getPoster.name,
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
            if (Postblacklist.includes(pt._id)) continue;

            const getPoster = await users.findOne({ _id: pt.user_id })
            const pt_likes = abbreviate(pt.likes.length, 2)
            const pt_created = new Date(pt.created_at).toDateString()

            const post_object = {
                _id: pt._id,
                user_id: getPoster.user_id,
                username: getPoster.username,
                name: getPoster.name,
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
            if (Postblacklist.includes(pt._id)) continue;

            const getPoster = await users.findOne({ _id: pt.user_id })
            const pt_likes = abbreviate(pt.likes.length, 2)
            const pt_created = new Date(pt.created_at).toDateString()

            const post_object = {
                _id: pt._id,
                user_id: getPoster.user_id,
                username: getPoster.username,
                name: getPoster.name,
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

        const Getposts = await posts.find({censored: false || undefined})

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
                name: getPoster.name,
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

        const sortResults = results.sort((a, b) => (parseFloat(b.created_at) - parseFloat(a.created_at)))

        return res.status(200).json({ success: true, message: "Topic found.", posts: sortResults, code: 200 })

    } catch (e) {

        console.error(e)
        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }



})

router.get('/feeds', verifyUserToken, async (req, res) => {

    try {
        const user = req.authorized_account
    

        const getPosts = await posts.find({censored: false || undefined})
        const userTopics = [...new Set(user.interests)]

        const filterByinterests = getPosts.filter(i => i.topics.some(topic => userTopics.includes(topic)))
        const followerFeeds = getPosts.filter(i => user.following.some(u => u === i.user_id))

        const totalArray1 = [...filterByinterests, ...followerFeeds]
        const totalArray = [...new Set(totalArray1)]



        const feeds = []
        const sent = []
        const TopicsFor = userTopics.sort(() => Math.random() - Math.random()).slice(0, 10)
        const TopicsForU = [...new Set(TopicsFor)]

      

        for (const pt of totalArray) {

            const getPoster = await users.findOne({ _id: pt.user_id })
            const pt_likes = abbreviate(pt.likes.length, 2)
            const pt_created = new Date(pt.created_at).toDateString()

            const post_object = {
                _id: pt._id,
                user_id: getPoster.user_id,
                username: getPoster.username,
                name: getPoster.name,
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
            sent.push(pt._id)


        }





        const recommendations = []

        if (feeds.length < 30) {

            const sortGetPosts = getPosts.sort((a, b) => (a.likes.length < b.likes.length ? 1 : -1)).filter(i => i.likes.length > 0)

            for (const pt of sortGetPosts) {


                if (sent.includes(pt._id)) { continue; }

                const getPoster = await users.findOne({ _id: pt.user_id })
                const pt_likes = abbreviate(pt.likes.length, 2)
                const pt_created = new Date(pt.created_at).toDateString()

                const post_object = {
                    _id: pt._id,
                    user_id: getPoster.user_id,
                    username: getPoster.username,
                    name: getPoster.name,
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



            }
        }

        const fixedFeeds = [...new Set(feeds)].sort((a, b) => (parseFloat(b.created_at) - parseFloat(a.created_at)))
        const fixedRec = [...new Set(recommendations)]


        return res.status(200).json({ success: true, message: "Here's your feeds.", feeds: fixedFeeds, recommendations: fixedRec, topics: TopicsForU, code: 200 })

    } catch (e) {

        console.error(e)
        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }


})

router.get('/stats', async (req, res) => {

    try {
        const getUsers = await users.find()
        const getPosts = await posts.find({ type: 'POST' })
        const getQuestions = await posts.find({ type: 'QUESTION' })
        const getReplies = await replies.find()

        return res.status(200).json({ success: true, message: "Here are the stats", total_users: abbreviate(getUsers.length, 2), total_posts: abbreviate(getPosts.length, 2), total_questions: abbreviate(getQuestions.length, 2), total_replies: abbreviate(getReplies.length, 2), code: 200 })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }


})

router.get('/following', async (req, res) => {

    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ success: false, message: "Please provide a username.", code: 400 })
        }

        const getUser = await users.findOne({ username: username })

        if (!getUser) {
            return res.status(400).json({ success: false, message: "User not found.", code: 404 })
        }



        const following = []

        for (const f of getUser.following) {
            const getFollowing = await users.findOne({ _id: f })
            if(!getFollowing) continue;
            const user_object = {
                _id: f,
                username: getFollowing.username,
                name: getFollowing.name,
                bio: getFollowing.bio,
                avatar_url: getFollowing.avatar_url
            }

            following.push(user_object)
        }

        return res.status(200).json({ success: true, message: "Successfully loaded the users this user follows", following: following, code: 200 })



    } catch (e) {
        console.error(e)
        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }
})

router.get('/followers', async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ success: false, message: "Please provide a username.", code: 400 })
        }

        const getUser = await users.findOne({ username: username })

        if (!getUser) {
            return res.status(400).json({ success: false, message: "User not found.", code: 404 })
        }



        const followers = []

        for (const f of getUser.followers) {
            const getFollowers = await users.findOne({ _id: f })
            if(!getFollowers) continue;
            const user_object = {
                _id: f,
                username: getFollowers.username,
                name: getFollowers.name,
                bio: getFollowers.bio,
                avatar_url: getFollowers.avatar_url
            }

            followers.push(user_object)
        }

        return res.status(200).json({ success: true, message: "Successfully loaded the followers of this user", followers: followers, code: 200 })



    } catch (e) {
        console.error(e)
        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }
})


router.get("/suggested_accounts", verifyUserToken, async(req, res) => {
    try {
    const user = req.authorized_account;
    let following = user.following.sort(() => Math.random() - Math.random()).slice(0, 10);

    const suggestions = []

    

    for (const f of following) {
        const user_fol = await users.findOne({_id: f, censored: false || undefined})
        if(!user_fol) continue;
        const randomFollowing = user_fol.following[Math.floor(Math.random()*user_fol.following.length)] || null;
        if(randomFollowing === user._id) continue;
        if(user.following.includes(randomFollowing)) continue;
        if(randomFollowing === null) continue;
       const findUser = await users.findOne({_id: randomFollowing})
       if(!findUser) break;
       const user_obj = {
        _id: findUser._id,
        username: findUser.username,
        name: findUser.name,
        avatar_url: findUser.avatar_url,
        following: findUser.following,
        followers: findUser.followers,
        reason_for_suggestions: 'Followed by people you follow'
       }
       suggestions.push(user_obj)

        
        
    }

    if(suggestions.length < 1 || following.length < 1) {
        const FindRandomUsersToSugges = await users.find({verified: true, censored: false || undefined})
        const FindRandomUsersToSuggest = FindRandomUsersToSugges.sort(() => Math.random() - Math.random()).slice(0, 10);

        for (const ru of FindRandomUsersToSuggest) {
            if(user.following.includes(ru._id)) continue;
            if(user._id === ru._id) continue;
            const user_obj = {
                _id: ru._id,
                username: ru.username,
                name: ru.name,
                avatar_url: ru.avatar_url,
                following: ru.following,
                followers: ru.followers,
                reason_for_suggestions: 'Recommended for You'
               }
               suggestions.push(user_obj)

        }

    }

    return res.status(200).json({success: true, message: "Here are your suggested users", suggestions: suggestions, code: 200})
} catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
}

})

module.exports = router;