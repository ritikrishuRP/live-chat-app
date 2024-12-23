const express = require('express')
const router = express.Router()

const userAuthentication = require('../middleware/auth')
const groupController = require('../controller/group.controller')

router.post('/create' , userAuthentication.authenticate  , groupController.createNewGroup)
router.get('/get-groups' , userAuthentication.authenticate  , groupController.getGroups)
router.get('/join-group/:groupId' , userAuthentication.authenticate  , groupController.joinGroup)
router.get('/all-users/:groupId' , userAuthentication.authenticate  ,groupController.getUsers)
router.get('/other-users' , userAuthentication.authenticate  , groupController.getOtherUsers)

module.exports = router;