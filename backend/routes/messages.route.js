const { fn, Sequelize, col, Op, DATE } = require('sequelize');
const Group = require('../models/group.model')
const User = require('../models/user.model')
const Member = require('../models/member.model')
const Message = require('../models/message.model')
const jwt = require('jsonwebtoken');


module.exports = (io, socket) => {
    const addMessage = async (data, cb) => {
        console.log('add message')
        console.log(data)
    
        const groupId = data.groupId;
        const message = data.message;
        const group = await Group.findByPk(groupId);
    
        const user = await group.getUsers({ where: { id: socket.user.userId } });
        const member = user[0].member;
    
        // Create the message in the database
        const result = await member.createMessage({ message, groupId });
    
        // Emit the message to all users in the group (including the sender)
        socket.to(groupId).emit('message:receive-message', { message, sender: socket.user.username });
    
        console.log(socket.user);
    
        await cb();
    }
    
    

    socket.on('join-room', async (groupId, cb) => {
        console.log("Socket user:", socket.user); // Debug the socket.user value
    
        if (!socket.user || !socket.user.userId) {
            console.error("User is not authenticated or missing ID:", socket.user);
            return cb({ error: "User is not authenticated" });
        }
    
        try {
            // Fetch group by ID
            const group = await Group.findByPk(groupId);
            if (!group) {
                console.error(`Group not found for ID: ${groupId}`);
                return cb({ error: "Group not found" });
            }
    
            // Log the group users
            const users = await group.getUsers();
            console.log("Users in group:", users); // Log users in the group
    
            // Look for the user in the group
            const user = users.find(u => u.id === socket.user.userId);
            if (!user) {
                console.error("User not part of the group:", socket.user.userId);
                return cb({ error: "User not part of the group" });
            }
    
            // Get the member object associated with the user
            const member = user.member;
            if (!member) {
                console.error("User does not have a member record");
                return cb({ error: "User membership not found" });
            }
    
            // Fetch messages
            let messages = await group.getMessages();
            
            // Ensure messages is an array
            if (!Array.isArray(messages)) {
                if (messages && messages.get) {
                    // If it's a Sequelize instance, use .get() to get the raw data
                    messages = messages.get({ plain: true });
                } else {
                    // If it's a single message, wrap it in an array
                    messages = [messages];
                }
            }
    
            // Fetch users for the group
            const groupUsers = await group.getUsers({
                attributes: {
                    exclude: ["password"], // Exclude sensitive fields
                },
            });
    
            // Return the fetched messages, member id, and users to the client via callback
            cb(messages, member.id, groupUsers);
        } catch (error) {
            console.error("Error in join-room:", error);
            cb({ error: "An error occurred while joining the room" });
        }
    });
    
    
    
    
    
    
    
    socket.on('message:send-message', addMessage)
}