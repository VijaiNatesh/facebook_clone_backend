const express = require("express")
const userRoute = express.Router()
const User = require('../../models/User')
const isEmailValid = require('../../utils/isEmailValid')
const bcrypt = require('bcryptjs')

userRoute.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    let error = {}
    if (!name || name.trim().length === 0) {
        error.name = 'Fill Name Field'
    }

    if(!isEmailValid(email)){
        error.email = 'Enter valid email'
    }
    
    if (!email || email.trim().length === 0) {
        error.email = 'Enter an Email ID'
    }      
    
    if (!password || password.trim().length === 0) {
        error.password = 'Password Required'
    }

    if (Object.keys(error).length) {
        return res.status(422).json({ error })
      }
    
    try {
        const user = await User.findOne({ email })
        if (user) {
            res.send('User Already Exists')
        }
        const newUser = await User.create({
            name, email, password
        })
        newUser.active = true
        res.send(`Account created for ${name} with mail => ${email}`)
    }
    catch (error) {
        res.send('Something Went Wrong')
    }
})

userRoute.post('/login', async(req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.send("Enter all the fields")
    }
    const user = await User.findOne({email})
    if(!user){
        res.send("User does not exists")
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        res.send("Invalid Credentials")
    }
    user.active = true
    res.send(user)
})

userRoute.put('/changepassword/:id', async(req, res) => {
    let { currentPassword, newPassword } = req.body
    try {    
        const userId = req.params.id;
      const user = await User.findById(userId)
      let matchPassword = await bcrypt.compare(currentPassword, user.password)
      if(!matchPassword){
          return res.status(400).json({error:"Current Password is Incorrect Please Try Again"})
      }
  
      if(!newPassword){
        return res.status(400).json({error:"Current Password is Required"})
      }
  
     
      user.password = newPassword
      await user.save()
      res.send(user)
  
    } catch (err) {
      console.log(err)
      return res.status(500).json({error:"Something went wrong"})
    }
})

userRoute.get('/logout/:id', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (user) {
          user.active = false
          await user.save()
    
          const accountData = {
            id: user.id,
            name: user.name,
            email: user.email,
            profile_pic: user.profile_pic,
          }
    
          res
            .status(201)
            .json({ message: 'logout successfully', account: accountData })
        } else {
          res.status(404).json({ error: 'user not found' })
        }
      } catch (err) {
        console.log(err)
        return res.status(500).json({error:"Something went wrong"})
      }
})


module.exports = userRoute