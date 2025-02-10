const bcrypt = require('bcrypt');
const User = require('../models/user.model'); // Assuming you have a User model
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const OnlineUser = require('../models/onlineUser.model')



// Handle signup
exports.signup = async (req, res) => {
    // console.log('Received signup data:', req.body);  // Log incoming request data
    
    const { username, email, phone, password } = req.body;

    // Validate data and respond with a 400 status if any field is missing
    if (!username || !email || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({
            where: { email }  // Ensure email is included in where clause
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists', success: false });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
            username,
            email,
            phone,
            password: hashedPassword
        });
        

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', success: true });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};

const generateAccessToken = (id, username) => {
    return jwt.sign({ userId: id, username: username }, process.env.JWT_SECRET_KEY);
};

// Handle login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password', success: false });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password', success: false });
        }

        await OnlineUser.upsert({ userId: user.id, loginTime: new Date() });


        res.status(200).json({ message: 'Login successful', success: true ,
            token: generateAccessToken(user.id, user.username)
    });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};

exports.logoutUser = async (req, res) => {
    const userId = req.user?.userId;  // Optional chaining to handle undefined req.user
    // console.log("UserId:", userId);    // Debugging line to check if userId is defined

    if (!userId) {
        return res.status(400).json({ error: "User ID not found in request" });
    }

    try {
        // Remove user from online status
        await OnlineUser.destroy({ where: { userId } });
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error updating online status:', error);
        res.status(500).json({ error: 'Failed to log out' });
    }
};
