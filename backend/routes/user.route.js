const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const userAuthentication = require('../middleware/auth')


router.post('/signup',userController.signup);
router.post('/login', userController.login);
router.post('/logout', userAuthentication.authenticate, userController.logoutUser);

module.exports = router;