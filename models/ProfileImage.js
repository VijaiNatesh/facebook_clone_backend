const mongoose = require('mongoose')
const conn = mongoose.createConnection(process.env.MONGO_URL)

const profileImageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profileImage : {
        data: Buffer,
        contentType : String
    }
})


profileImageSchema.virtual('userdetails', {
    ref: 'User',
    foreignField: '_id',
    localField: 'user',
  });
profileImageSchema.set('toJSON', { virtuals: true });

const ProfileImage = conn.model("ProfileImage", profileImageSchema)
module.exports = ProfileImage