var ObjectId = require('mongodb').ObjectId
const mongoose = require('mongoose')
const express = require('express')
const fetchUser = express.Router();
const User = require('../../models/User')
const Notification = require('../../models/Notification')
const FriendRequest = require('../../models/FriendRequest')
const FilterUserData = require('../../utils/filterUserData')

fetchUser.get('/:user_id', async (req, res) => {
    try {
        const user = await User.findById(req.params.user_id).populate('friends')
        const userData = FilterUserData(user)

        res.status(200).json({ user: userData })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

fetchUser.get('/recommanded_users/:userId', async (req, res) => {

    try {
        const users = await User.find().where('_id').ne(req.params.userId)
        console.log(users)
        const usersData = users.map((user) => {
            return FilterUserData(user)
        })
        res.status(200).json({ users: usersData })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

fetchUser.get('/me/:userId', async (req, res) => {

    try {

        const user = await User.findById(req.params.userId).populate('friends')
        if (!user) {
            return res.status(404).json({ error: 'user not found' })
        }

        const userData = FilterUserData(user)

        const friends = user.friends.map((friend) => {
            return {
                ...FilterUserData(friend),
            }
        })

        userData.friends = friends
        const notifications = await Notification.find({ user: req.params.userId }).sort({
            createdAt: -1,
        })
        let notifData = notifications.map((notif) => {
            return {
                id: notif.id,
                body: notif.body,
                createdAt: notif.createdAt,
            }
        })

        res.status(200).json({ user: userData, notifications: notifData })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

fetchUser.get('/friend_request/received/:userId', async (req, res) => {
    try {
        const friends = await FriendRequest.find({
            $and: [{ isAccepted: false }, { receiver: req.params.userId }],
        }).populate('sender', '_id name profile_pic active', User)      
             
        res.status(200).json({ friends: friends })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

fetchUser.get('/friend_request/sended/:userId', async (req, res) => {
    try {
        const friends = await FriendRequest.find({
            $and: [{ isAccepted: false }, { sender: req.params.userId }],
        }).populate('receiver', "", User)
        const friendsData = friends.map((friend) => {
            return {
                id: friend.id,
                user: FilterUserData(friend.receiver),
            }
        })

        res.status(200).json({ friends: friendsData })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

fetchUser.get('/search', async (req, res) => {
    try {
        const users = await User.find({
            name: { $regex: req.query.name, $options: 'i' },
        }).populate("friends")

        const usersData = users.map((user) => FilterUserData(user))

        res.status(200).json({ users: usersData })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})

module.exports = fetchUser