const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AuthUser = require('./models/authUser');
const Store = require('./models/store');
const Vehicle = require('./models/vehicle');
const Item = require('./models/item');

dotenv.config();

const stores = [
  {
    id: 'ST-CMB-01', name: 'Colombo Main Store', region: 'Western Province', subRegion: 'Colombo District',
    address: 'Peliyagoda Logistics Park, Kelaniya', coordinates: '6.9742° N, 79.8893° E',
    phone: '+94 11 243 8910', hours: '08:00 AM - 06:00 PM', rules: 'Max 3 trucks per hour',
    capacity: '24,000 MT', docks: '16 Active Docks', utilization: 74,
  },
  {
    id: 'ST-KND-02', name: 'Kandy Regional Depot', region: 'Central Province', subRegion: 'Kandy District',
    address: 'Katugastota Road, Kandy', coordinates: '7.3297° N, 80.6224° E',
    phone: '+94 81 222 6410', hours: '08:00 AM - 05:30 PM', rules: 'Max 2 trucks per hour',
    capacity: '12,500 MT', docks: '8 Active Docks', utilization: 58,
  },
  {
    id: 'ST-GAL-03', name: 'Galle Coastal Staging', region: 'Southern Province', subRegion: 'Galle District',
    address: 'Wakwella Road, Galle', coordinates: '6.0535° N, 80.2210° E',
    phone: '+94 91 224 7150', hours: '08:30 AM - 05:30 PM', rules: 'Scheduled loading slot required',
    capacity: '18,200 MT', docks: '10 Active Docks', utilization: 81,
  },
];

const vehicles = [
  { id: 'VH-401', plate: 'WP LH-4521', vin: 'VIN-SAMPLE-401', model: 'Isuzu ELF 3.3t', type: 'Dry Freight Van', payload: '3.3 Tons', volume: '15 m³', store: 'ST-CMB-01', odometer: '0 km', status: 'Active' },
  { id: 'VH-402', plate: 'LP-WD-5020', vin: 'VIN-SAMPLE-402', model: 'Fuso eCanter EV', type: 'Electric Freight Van', payload: '4 Tons', volume: '20 m³', store: 'ST-KND-02', odometer: '0 km', status: 'Active' },
];

const items = [
  { id: 'ITM-001', name: 'Tea & Spices (Export Grade)', description: 'Packed tea and spices', category: 'Dry Goods', uom: 'Cartons', weight: '20 kg' },
  { id: 'ITM-002', name: 'Fresh Milk & Dairy', description: 'Chilled dairy products', category: 'Cold Chain', uom: 'Crates', weight: '15 kg' },
  { id: 'ITM-003', name: 'Spices Assortment', description: 'Packaged spice products', category: 'Dry Goods', uom: 'Crates', weight: '10 kg' },
];

async function seed() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured');
    await mongoose.connect(process.env.MONGO_URI);

    for (const store of stores) await Store.updateOne({ id: store.id }, { $setOnInsert: store }, { upsert: true });
    for (const vehicle of vehicles) await Vehicle.updateOne({ id: vehicle.id }, { $setOnInsert: vehicle }, { upsert: true });
    for (const item of items) await Item.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true });

    const adminEmail = 'admin@smartfleet.com';
    const existingAdmin = await AuthUser.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await AuthUser.create({
        name: 'Admin User', email: adminEmail, phone: '+94 77 000 0000',
        password: 'admin123', role: 'ADMIN', store: null, status: 'Active',
      });
    }

    console.log('Sample data seeded without deleting existing records.');
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
