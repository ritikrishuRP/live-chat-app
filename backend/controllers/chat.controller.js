// controllers/chatController.js
const Message = require('../models/message.model');
const User = require('../models/user.model');
const OnlineUser = require('../models/onlineUser.model');

exports.getOnlineUsers = async (req, res) => {
    try {
        const onlineUsers = await OnlineUser.findAll({
            include: [{ model: User, as: 'user', attributes: ['username'] }]
        });
        res.json(onlineUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch online users' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({ include: [{ model: User, as: 'user', attributes: ['username'] }] });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

exports.sendMessage = async (req, res) => {
    const { content } = req.body;
    const userId = req.user.userId; // Access userId from authenticated user

    try {
        const newMessage = await Message.create({ userId, content });
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

