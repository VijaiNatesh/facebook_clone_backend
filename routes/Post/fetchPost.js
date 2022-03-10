const express = require('express')
const fetchPost = express.Router()
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const FilterPostData = require('../../utils/filterPostData')
const User = require('../../models/User')

fetchPost.get('/', async (req, res) => {
    let page = parseInt(req.query.page || 0)
    let limit = 3

    try {
        const posts = await Post.find()


        let postsData = posts.map((post) => FilterPostData(post))

        const totalCount = await Post.estimatedDocumentCount().exec()
        const paginationData = {
            currentPage: page,
            totalPage: Math.ceil(totalCount / limit),
            totalPost: totalCount
        }
        res.status(200).json({ posts: postsData, pagination: paginationData })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

fetchPost.get('/:postId', async(req, res) => {
    try {
        const post = await Post.findById(req.params.postId)         
    
        let postData = FilterPostData(post)
    
        res.status(200).json({ post: postData })
      } catch (err) {
        console.log(err)
        return res.status(500).json({error:"Something went wrong"})
      }
})

module.exports = fetchPost