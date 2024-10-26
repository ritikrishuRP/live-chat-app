const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./utils/db');

const authRoutes = require('./routes/user.route');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Route for API calls
app.use('/api', authRoutes);

// Serve the main frontend page on root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Sync with database and start the server
sequelize
  .sync()
  .then(() => {
    app.listen(8000, () => {
      console.log('Server is running on port 8000');
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });