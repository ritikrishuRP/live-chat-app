// Middleware: authenticate.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        req.user = { userId: user.id, ...user.dataValues };  // Attach userId and user details
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

module.exports = {
    authenticate
};
