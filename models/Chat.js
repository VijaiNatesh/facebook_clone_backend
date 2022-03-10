const mongoose = require('mongoose')
const conn = mongoose.createConnection(process.env.MONGO_URL)

const ChatSchema = new mongoose.Schema({

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    body: {
        type: Object,
        required: true,
    },
},
    { timestamps: true },
)

const Chat = conn.model("Chat", ChatSchema)
module.exports = Chat