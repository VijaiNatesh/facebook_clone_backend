const express = require('express')
const chatRoute = express.Router()
const User = require('../../models/User')
const Chat = require('../../models/Chat')
const FilterUserData = require('../../utils/filterUserData')

chatRoute.post('/:friendId/send', async (req, res) => {
    const { text, image, userId } = req.body

    if (!text && !image) {
        return res
            .status(422)
            .json({ error: 'Don`t send empty message type something' })
    }
    try {
        const friend = await User.findById(req.params.friendId)
        if (!friend) {
            return res.status(404).json({ error: 'Friend Not Found' })
        }

        const chat = new Chat({
            sender: userId,
            receiver: req.params.friendId,
            body: {
                text: text || '',
                image: image || '',
            },
        })

        const saveChat = await chat.save()

        const getChat = await Chat.findById(saveChat.id)
            .populate('sender', "", User)
            .populate('receiver', "", User)
        const chatdata = {
            id: saveChat.id,
            sender: FilterUserData(getChat.sender),
            receiver: FilterUserData(getChat.receiver),
            body: getChat.body,
            createdAt: getChat.createdAt,
        }
        res.status(201).json({ data: chatdata })
        // if (getChat.receiver.socketId) {
        //   req.io
        //     .to(getChat.receiver.socketId)
        //     .emit('new-message', { data: chatdata })
        // }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})


chatRoute.get('/:friendId/get_messages', async (req, res) => {

    const { userId } = req.body;
    try {
        const messages = await Chat.find({
            $or: [
                { sender: userId, receiver: req.params.friendId },
                { receiver: userId, sender: req.params.friendId },
            ],
        })
            .populate('sender', "", User)
            .populate('receiver', "", User)

        const messagesData = messages.map((message) => {
            return {
                id: message._id,
                sender: FilterUserData(message.sender),
                receiver: FilterUserData(message.receiver),
                body: message.body,
                createdAt: message.createdAt,
            }
        })

        res.status(200).json({ data: messagesData })
        if (getChat.receiver.socketId) {
            req.io
                .to(getChat.receiver.socketId)
                .emit('new-message', { data: chatdata })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Something went wrong" })
    }
})


module.exports = chatRoute;