// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const userAuthentication = require('../middleware/auth')

router.get('/messages', userAuthentication.authenticate, chatController.getMessages);
router.post('/send-message', userAuthentication.authenticate, chatController.sendMessage);
router.get('/online-users', userAuthentication.authenticate, chatController.getOnlineUsers);

module.exports = router;
