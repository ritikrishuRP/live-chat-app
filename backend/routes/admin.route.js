const express = require('express')
const router = express.Router()

const userAuthentication = require('../middleware/auth')
const adminControllers = require('../controller/admin.controller')

router.post('/remove-member/:groupId' , userAuthentication.authenticate , adminControllers.removeMember)

router.post('/make-admin/:groupId' , userAuthentication.authenticate  , adminControllers.makeAdmin)

router.post('/remove-admin/:groupId' , userAuthentication.authenticate  , adminControllers.removeAdmin)
router.post('/show-users/:groupId' , userAuthentication.authenticate  , adminControllers.showUser)
router.post('/add-user/:groupId' , userAuthentication.authenticate  , adminControllers.addUser)

module.exports = router;
