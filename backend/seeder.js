const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Store = require('./models/Store');
const Vehicle = require('./models/Vehicle');
const Item = require('./models/Item');

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected for Seeding...');
};

const importData = async () => {
  try {
    await User.deleteMany();
    await Store.deleteMany();
    await Vehicle.deleteMany();
    await Item.deleteMany();

    // 1. Stores (SRS එකේ තියෙන විදියට)
    const stores = await Store.insertMany([
      { name: 'Pelayagoda Central Hub', code: 'PEL-01', location: { address: 'Pelayagoda', lat: 6.95, lng: 79.89 } },
      { name: 'Colombo Central Depot', code: 'COL-01', location: { address: 'Colombo', lat: 6.9271, lng: 79.8612 } },
      { name: 'Kandy Regional Depot', code: 'KAN-01', location: { address: 'Kandy', lat: 7.2906, lng: 80.6337 } }
    ]);

    // 2. Admin User
    await User.create({
      name: 'Admin User',
      email: 'admin@smartfleet.com',
      password: 'admin123',
      role: 'System Administrator'
    });

    // 3. Sample Vehicles
    await Vehicle.insertMany([
      { registrationNumber: 'WP LH-4521', type: 'Isuzu ELF 3.3t', capacityWeightKg: 3300, capacityVolumeM3: 15 },
      { registrationNumber: 'LP-WD-5020', type: 'Fuso eCanter EV', capacityWeightKg: 4000, capacityVolumeM3: 20 }
    ]);

    // 4. Sample Items
    await Item.insertMany([
      { code: 'ITM-001', name: 'Tea & Spices (Export Grade)', unitOfMeasure: 'kg' },
      { code: 'ITM-002', name: 'Highland Fresh Milk & Dairy', unitOfMeasure: 'Crates' },
      { code: 'ITM-003', name: 'Ceylinco Spices Assortment', unitOfMeasure: 'Crates' }
    ]);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(importData);