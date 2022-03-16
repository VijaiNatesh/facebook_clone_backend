const express = require('express')
const userAction = express.Router()
const User = require('../../models/User')
const FriendRequest = require('../../models/FriendRequest')
const Notification = require('../../models/Notification')
const filterUserData = require('../../utils/filterUserData')
const CreateNotification = require('../../utils/createNotification')

userAction.get('/friend_request/:userId/send', async (req, res) => {
    const {userId} = req.body
    try {
        const user = await User.findById(req.params.userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        if (userId == req.params.userId) {
            return res
                .status(400)
                .json({ error: 'You cannot send friend request to yourself' })
        }

        if (user.friends.includes(userId)) {
            return res.status(400).json({ error: 'Already Friends' })
        }

        const friendRequest = await FriendRequest.findOne({
            sender: userId,
            receiver: req.params.userId,
        })

        if (friendRequest) {
            return res.status(400).json({ error: 'Friend Request already send' })
        }

        const newFriendRequest = new FriendRequest({
            sender: userId,
            receiver: req.params.userId,
        })

        const save = await newFriendRequest.save()

        const friend = await FriendRequest.findById(save.id).populate('receiver', '', User)

        const chunkData = {
            id: friend.id,
            user: filterUserData(friend.receiver),
        }

        res
            .status(200)
            .json({ message: 'Friend Request Sended', friend: chunkData })

        const sender = await FriendRequest.findById(save.id).populate('sender', '', User)
        let notification = await CreateNotification({
            user: req.params.userId,
            body: `${sender.sender.name} has send you friend request`,
        })
        const senderData = {
            id: sender.id,
            user: filterUserData(sender.sender),
        }
        if (user.socketId) {
            req.io
              .to(user.socketId)
              .emit('friend-request-status', { sender: senderData })
            req.io.to(user.socketId).emit('Notification', { data: notification })
          }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

userAction.get('/friend_request/:requestId/accept', async (req, res) => {
    const { userId } = req.body;
    try {
        const friendsRequest = await FriendRequest.findById(req.params.requestId)
        if (!friendsRequest) {
            return res
                .status(404)
                .json({ error: 'Request already accepted or not sended yet' })
        }

        const sender = await User.findById(friendsRequest.sender)
        if (sender.friends.includes(friendsRequest.receiver)) {
            return res.status(400).json({ error: 'already in your friend lists' })
        }
        sender.friends.push(userId)
        await sender.save()

        const currentUser = await User.findById(userId)
        if (currentUser.friends.includes(friendsRequest.sender)) {
            return res.status(400).json({ error: 'already  friend ' })
        }
        currentUser.friends.push(friendsRequest.sender)
        await currentUser.save()

        const chunkData = filterUserData(sender)

        await FriendRequest.deleteOne({ _id: req.params.requestId })
        res
            .status(200)
            .json({ message: 'Friend Request Accepted', user: chunkData })

        let notification = await CreateNotification({
            user: sender.id,
            body: `${currentUser.name} has accepted your friend request`,
        })
        if (sender.socketId) {
          let currentUserData = FilterUserData(currentUser)
          req.io.to(sender.socketId).emit('friend-request-accept-status', {
            user: currentUserData,
            request_id: req.params.requestId,
          })
          req.io.to(sender.socketId).emit('Notification', { data: notification })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

userAction.get('/friend_request/:requestId/cancel', async (req, res) => {
    try {
        const friendsRequest = await FriendRequest.findById(
            req.params.requestId,
        ).populate('receiver', ' ', User)
        if (!friendsRequest) {
            return res
                .status(404)
                .json({ error: 'Request already cenceled or not sended yet' })
        }
        await FriendRequest.deleteOne({ _id: req.params.requestId })

        res.status(200).json({ message: 'Friend Request Canceled' })
        if (friendsRequest.receiver.socketId) {
            req.io
                .to(friendsRequest.receiver.socketId)
                .emit('sended-friend-request-cancel', {
                    requestId: req.params.requestId,
                })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

userAction.get('/friend_request/:requestId/decline', async (req, res) => {
    try {
        const friendsRequest = await FriendRequest.findById(
            req.params.requestId,
        ).populate('sender', ' ', User)
        if (!friendsRequest) {
            return res
                .status(404)
                .json({ error: 'Request already declined or not sended yet' })
        }
        await FriendRequest.deleteOne({ _id: req.params.requestId })

        res.status(200).json({ message: 'Friend Request Declined' })
        // if (friendsRequest.sender.socketId) {
        //     req.io
        //         .to(friendsRequest.sender.socketId)
        //         .emit('received-friend-request-decline', {
        //             requestId: req.params.requestId,
        //         })
        // }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

userAction.put('/profile_pic/update', async (req, res) => {
    const { profile_url, userId } = req.body
    try {
        const user = await User.findById(userId)
        user.profile_pic = profile_url
        await user.save()

        const getUser = await User.findById(userId).populate('friends')
        const userData = filterUserData(getUser)

        const friends = getUser.friends.map((friend) => {
            return {
                ...filterUserData(friend),
            }
        })

        userData.friends = friends
        res.status(200).json({ message: 'profile image updated', user: userData })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

userAction.put('/cover_pic/update', async(req, res) => {
    const { cover_url, userId } = req.body
    try {
      const user = await User.findById(userId)
      user.cover_image = cover_url
      await user.save()
  
      const getUser = await User.findById(userId).populate('friends')
      const userData = filterUserData(getUser)
  
      const friends = getUser.friends.map((friend) => {
        return {
          ...filterUserData(friend),
        }
      })
  
      userData.friends = friends
      res.status(200).json({ message: 'Cover image updated', user: userData })
    } catch (err) {
      console.log(err)
      return res.status(500).json({error:"Something went wrong"})
    }
})

userAction.put('/update_profile/:input', async(req, res) => {
    const {name, email, bio, location, education, userId} = req.body
    try {
        const user = await User.findById(userId)
    
        if (req.params.input === 'name') {
          user.name = name
        }
        if (req.params.input === 'email') {
          user.email = email
        }
    
        if (req.params.input === 'bio') {
          user.bio = bio
        }
        if (req.params.input === 'location') {
          user.location = location
        }
        if (req.params.input === 'education') {
          user.education = education
        }
    
        await user.save()
        res.status(200).json({ message: 'Updated Successfully' })
      } catch (err) {
        console.log(err)
        return res.status(500).json({error:"Something went wrong"})
      }
})

userAction.delete('/notifications/clear', async(req, res) => {
    const {userId} =  req.body;
    try {
        await Notification.deleteMany({ user: userId })
        res.status(200).json({ message: 'Notification Cleared Successfully' })
      } catch (err) {
        console.log(err)
        return res.status(500).json({error:"Something went wrong"})
      }
})

module.exports = userAction