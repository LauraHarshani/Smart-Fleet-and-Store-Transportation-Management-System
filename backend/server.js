const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Models
const Store = require('./models/Store');

// Routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes'); 

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => res.send('Smart Fleet API is running...'));

// Store Route
app.get('/api/stores', async (req, res) => {
  try {
    const stores = await Store.find();
    res.status(200).json({ success: true, count: stores.length, data: stores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes); 
app.use('/api/items', itemRoutes);       
app.use('/api/users', userRoutes);       

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));