const ObjectId = require('mongodb').ObjectID
const express = require('express')
const postAction = express.Router()
const User = require('../../models/User')
const Post = require('../../models/Post')
const FilterPostData = require('../../utils/filterPostData')
const sendDataToFriends = require('../../utils/sendDataToFriends')


postAction.post('/', async (req, res) => {

    let { content, image, user } = req.body

    if (!content && !image) {
        res.send("Post Image or Write Something. Can't upload empty post")
    }

    try {
        const createPost = await Post.create(req.body)

        const post = await Post.findById(createPost._id).populate('userdetails', 'name', User)

        const postData = FilterPostData(post)

        res
      .status(201)
      .json({ message: 'post created successfully', post: postData })

        let dataToSend = {
            req, key: "new-post", data: postData,
            notif_body: `${post.userdetails.name} has created new post`
        }
        await sendDataToFriends(dataToSend)
    }
    catch (err) {
        console.log(err)
        res.send("Something went wrong")
    }
})

postAction.get('/like_dislike/:postId', async (req, res) => {
    const { userId } = req.body
    try {
        const post = await Post.findById(req.params.postId)     

        if (!post) {

            return res.status(404).json({ error: 'post not found' })
        }

        let postData

        const index = post.likes.indexOf(userId)
        if (index !== -1) {
            post.likes.splice(index, 1)
            await post.save()
            postData = FilterPostData(post)

            res.status(200).json({ message: 'removed likes', post: postData })
            await sendDataToFriends({ req, key: "post-like-change", data: postData })
            return;

        }

        post.likes.push(userId)
        await post.save()
        postData = FilterPostData(post)
        res.status(200).json({ message: 'add like', post: postData })
        await sendDataToFriends({ req, key: "post-like-change", data: postData })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

module.exports = postAction;