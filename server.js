require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
require('./config/dbConnect')();
const userRoute = require('./routes/Auth/userRoute')
const postAction = require('./routes/Post/postAction')
const userAction = require('./routes/User/userAction')
const fetchPost = require('./routes/Post/fetchPost')
const commentRoute = require('./routes/Post/commentRoute')
const fetchUser = require('./routes/User/fetchUser')
const chatRoute = require('./routes/User/Chat')

app.use(cors())
app.use(express.json())
app.get('/', async(req, res) => {
    res.send("VJ Social-Media Backend")
})
app.use('/api/user', userRoute)
app.use('/api/postaction', postAction)
app.use('/api/useraction', userAction)
app.use('/api/fetchpost', fetchPost)
app.use('/api/comment', commentRoute)
app.use('/api/fetchuser', fetchUser)
app.use('/api/chat', chatRoute )

const PORT = process.env.PORT || 5000 ;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})