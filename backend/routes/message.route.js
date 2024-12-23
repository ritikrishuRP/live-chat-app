const express = require('express')
const router = express.Router()

const userAuthentication = require('../middleware/auth')
const messageControllers = require('../controller/message.controller')

router.post('/add-message' , userAuthentication.authenticate, messageControllers.addMessage)
router.get('/get-messages/:groupId' , userAuthentication.authenticate, messageControllers.getMessages)

module.exports = router;