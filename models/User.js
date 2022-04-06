const mongoose = require('mongoose')
const conn = mongoose.createConnection(process.env.MONGO_URL)
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },

  profile_pic: {
    data: Buffer,
    type: String,
    default:''  
  },

  cover_image: {
    type: String,
    default: '',
  },

  bio: {
    type: String,
    default: '',
    trim: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  socketId: {
    type: String,
    default: '',
  },
  jwtToken: [String],

  location: {
    type: Object,
  },
  education: {
    type: String,
    trim: true,
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
},
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});



const User = conn.model("User", UserSchema)
module.exports = User