require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/userModel');
const Plan = require('./models/planModel');
const Seat = require('./models/seatModel');
const Setting = require('./models/settingModel');

const PORT = process.env.PORT || 5000;

// Seed Database with Defaults
const seedData = async () => {
  try {
    // 1. Seed Admin
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@studyspace.com',
        phone: '9876543210',
        password: 'adminpassword123', // Will be hashed automatically by user model hooks
        role: 'admin',
        status: 'active',
      });
      console.log('✅ Seeded default Admin: admin@studyspace.com / adminpassword123');
    }

    // 2. Seed Settings
    let settings = await Setting.findOne({});
    if (!settings) {
      await Setting.create({});
      console.log('✅ Seeded default library settings');
    }

    // 3. Seed Membership Plans
    const planCount = await Plan.countDocuments({});
    if (planCount === 0) {
      const defaultPlans = [
        { planName: '1 Month Standard', duration: 1, price: 1000, description: 'Access to general study desks for 1 month.' },
        { planName: '3 Month Premium', duration: 3, price: 2700, description: 'Access to quiet desks with power outlets for 3 months.' },
        { planName: '6 Month Elite', duration: 6, price: 5000, description: 'Access to premium personal cubicles for 6 months.' },
      ];
      await Plan.insertMany(defaultPlans);
      console.log('✅ Seeded default membership plans');
    }

    // 4. Seed Seats
    const seatCount = await Seat.countDocuments({});
    if (seatCount === 0) {
      const defaultSeats = [];
      
      // Floor 1, Room A (10 Seats)
      for (let i = 1; i <= 10; i++) {
        defaultSeats.push({
          seatNumber: `A-${String(i).padStart(2, '0')}`,
          floor: 'Floor 1',
          room: 'Room A',
          status: 'available',
        });
      }

      // Floor 2, Room B (10 Seats)
      for (let i = 1; i <= 10; i++) {
        defaultSeats.push({
          seatNumber: `B-${String(i).padStart(2, '0')}`,
          floor: 'Floor 2',
          room: 'Room B',
          status: i % 4 === 0 ? 'maintenance' : 'available', // Seed a couple maintenance seats
        });
      }

      await Seat.insertMany(defaultSeats);
      console.log('✅ Seeded 20 default seats layout');
    }
  } catch (error) {
    console.error('❌ Data seeding error:', error);
  }
};

// Start Server
const startServer = async () => {
  // Connect to DB
  await connectDB();

  // Run Seed
  await seedData();

  // Start listening
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
