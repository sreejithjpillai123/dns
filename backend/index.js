const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spicekart_menu';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const menuRoutes = require('./routes/menus');
app.use('/api/menus', menuRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
