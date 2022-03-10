const mongoose = require('mongoose')
const conn = mongoose.createConnection(process.env.MONGO_URL)


const notificationSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

const Notification = conn.model('Notification' , notificationSchema)
module.exports = Notification;