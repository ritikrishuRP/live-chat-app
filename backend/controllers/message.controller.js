const { fn, Sequelize, col, Op, DATE } = require('sequelize');
const Group = require('../models/group.model')
const User = require('../models/user.model')
const Member = require('../models/member.model')
const Message = require('../models/message.model')

exports.addMessage = async (req, res) => {
    try {
        const groupId = req.body.groupId;

        const message = req.body.message;
        const group = await Group.findByPk(groupId)
        // const member = await Member.findOne({groupId , id : memberId})
        const user = await group.getUsers({ where: { id: req.user.id } })
        const member = user[0].member
        // return res.json(member)

        const result = await member.createMessage({ message, groupId })
        return res.json(result)


    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: "Internal server error" })
    }

}

exports.getMessages = async (req, res) => {
    try {
        const id = req.params.groupId;
        const messageId = req.query.messageId || 0
        const group = await Group.findByPk(id)
        const member = await req.user.getGroups({ where: { id } })
        if (member.length == 0) {
            return res.status(401).json({ msg: "unauthorized access" })
        }
        // return res.json(member)
        const result = await group.getMessages({
            where: {
                id: {
                    [Op.gt]: messageId
                }
            }
        });

        return res.json({ success: true, messages: result, id: member[0].member.id })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: "Internal server error" })

    }
}
