const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const sequelize = require('./utils/db');
const { Server } = require('socket.io');
const http = require('http');

// require('dotenv').config();

// Routes
const userRoutes = require('./routes/user.route');
const groupRoutes = require('./routes/group.route');
const messageRoutes = require('./routes/message.route');
const adminRoutes = require('./routes/admin.route');

// Models
const User = require('./models/user.model');
const Message = require('./models/message.model');
const Group = require('./models/group.model');
const Member = require('./models/member.model');

// Environment variables
dotenv.config();
// console.log('DB Port:', process.env.DB_PORT);

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:5500', // Adjust frontend origin
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('sendMessage', (data) => {
    try {
      if (data && data.groupId) {
        io.to(data.groupId).emit('receiveMessage', data);
      } else {
        console.error('Invalid message data:', data);
      }
    } catch (error) {
      console.error('Error handling sendMessage:', error);
    }
  });

  socket.on('joinGroup', (groupId) => {
    try {
      if (groupId) {
        socket.join(groupId);
        console.log(`User joined group ${groupId}`);
      } else {
        console.error('Invalid groupId:', groupId);
      }
    } catch (error) {
      console.error('Error handling joinGroup:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Define database relationships
User.belongsToMany(Group, { through: Member });
Group.belongsToMany(User, { through: Member });

Group.hasMany(Message);
Message.belongsTo(Group);

Member.hasMany(Message);
Message.belongsTo(Member);

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.use('/user', userRoutes);
app.use('/message', messageRoutes);
app.use('/group', groupRoutes);
app.use('/admin', adminRoutes);

// Sync database and start the server
sequelize
  .sync()
  .then(() => {
    server.listen(8000, () => {
      console.log('Server is running on port 8000');
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });