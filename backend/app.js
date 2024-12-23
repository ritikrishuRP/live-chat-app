const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const sequelize = require('./utils/db');
const { Server } = require('socket.io');
const http = require('http');

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

// Socket.IO Middleware
const { socketAuthenticate } = require('./middleware/auth');

io.use(async (socket, next) => {
  console.log(`Socket.IO middleware: Authenticating socket ID ${socket.id}`);
  try {
    await socketAuthenticate(socket, next); // Authenticate socket connection
    console.log(`Socket.IO middleware: Authentication successful for socket ID ${socket.id}`);
  } catch (err) {
    console.error(`Socket.IO middleware: Authentication failed for socket ID ${socket.id} - Error: ${err.message}`);
    next(err);
  }
});

// Handle Socket.IO Connections
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Confirm connection
  socket.emit('connectionSuccess', { message: 'You are successfully connected to the server!', socketId: socket.id });

  // Join hardcoded group (to match client-side logic)
  const hardcodedGroupId = 'd5767f79-5d91-46b6-a355-d2bb4dfeb919';
  socket.join(hardcodedGroupId);
  console.log(`Socket ${socket.id} joined group ${hardcodedGroupId}`);

  // Emit groupJoined event
  socket.emit('groupJoined', { groupId: hardcodedGroupId, socketId: socket.id });

  // Listen for send-message events
  socket.on('message:send-message', (data) => {
    console.log(`Message sent to group ${data.groupId}:`, data.message);
    io.to(data.groupId).emit('message:receive-message', {
      message: data.message,
      sender: socket.user?.username || 'Unknown',
      groupId: data.groupId,
    });
  });
  

  // Hardcoded message emit to test client behavior
  socket.emit('message:receive-message', {
    message: 'Test message',
    sender: 'Server',
    groupId: hardcodedGroupId,
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`A user disconnected: ${socket.id}`);
  });
});

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
