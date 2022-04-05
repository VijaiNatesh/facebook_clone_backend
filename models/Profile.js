const mongoose = require('mongoose')
const conn = mongoose.createConnection(process.env.MONGO_URL)

const profileSchema = new mongoose.Schema({    
    profile_pic: {
        type: String
    }
})


const Profile = conn.model("Profile", profileSchema)
module.exports = Profile;