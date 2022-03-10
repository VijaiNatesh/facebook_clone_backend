const mongoose = require('mongoose')
const conn = mongoose.createConnection(process.env.MONGO_URL)

const CommentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    body: {
        image: String,
        text: {
            type: String,
            trim: true,
        },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
})

const Comment = conn.model("Comment", CommentSchema)
module.exports = Comment