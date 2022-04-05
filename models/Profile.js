const mongoose = require('mongoose')
const conn = mongoose.createConnection(process.env.MONGO_URL)

const profileSchema = new mongoose.Schema({   
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    } ,
    profile_pic: {
        type: String
    }
})

profileSchema.virtual('userdetails', {
    ref: 'User',
    foreignField: '_id',
    localField: 'user',
  });
postSchema.set('toJSON', { virtuals: true });


const Profile = conn.model("Profile", profileSchema)
module.exports = Profile;