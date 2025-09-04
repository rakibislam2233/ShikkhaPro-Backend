import mongoose from 'mongoose';
import { config } from '../config';
import { seedFlightData } from '../seeders/flightDataSeeder';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.database.mongoUrl);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting flight data seeding script...');
    
    await connectDB();
    await seedFlightData();
    
    console.log('🎉 Flight data seeding completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Run the script
main();