const mongoose = require('mongoose')
const conn = mongoose.createConnection(process.env.MONGO_URL)

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        trim: true,
    },
    body: {
        feelings: {
            type: String,
            trim: true,
        },
        with: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        at: {
            type: String,
            trim: true,
        },
        date: String,
    },
    image: String,
    isProfilePost: {
        type: Boolean,
        default: false,
    },
    profilePostData: {
        coverImage: String,
        profileImage: String,
    },
    privacy: {
        type: String,
        enum: ['Only me', 'Public'],
        default: 'Public',
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'      
        },
    ],
    hearts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'           
        },
    ],
},
    { timestamps: true },
)


postSchema.virtual('userdetails', {
    ref: 'User',
    foreignField: '_id',
    localField: 'user',
  });
postSchema.set('toJSON', { virtuals: true });


const Post = conn.model("Post", postSchema)
module.exports = Post;