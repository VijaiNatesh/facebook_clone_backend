const mongoose = require('mongoose')
const conn = mongoose.createConnection(process.env.MONGO_URL)

const FriendRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      isAccepted: {
        type: Boolean,
        default: false,
      },
    },
      { timestamps: true },
)

const FriendRequest = conn.model('FriendRequest', FriendRequestSchema)

module.exports = FriendRequest