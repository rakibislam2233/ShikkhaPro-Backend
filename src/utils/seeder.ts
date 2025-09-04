import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/user/user.model';

// Load environment variables
dotenv.config();

// Function to drop the entire database
const dropDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log('------------> Database dropped successfully! <------------');
  } catch (err) {
    console.error('Error dropping database:', err);
  }
};

// Function to hash password
const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Function to seed users
const seedUsers = async () => {
  try {
    const usersData = [
      {
        email: 'rakib2020.tkg@gmail.com',
        password: '123456',
        role: 'Super_Admin',
        status: 'Active',
        profile: {
          firstName: 'Rakib',
          lastName: 'Ali',
          phone: '1234567890',
          address: 'Dhaka, Bangladesh',
        },
      },
      {
        email: 'info@claimbecon.com',
        password: '123456',
        role: 'Admin',
        status: 'Active',
        profile: {
          firstName: 'Claim ',
          lastName: 'Becon',
          phone: '1234567890',
          address: 'Usa',
        },
      },
    ];

    // Hash the password before saving users
    for (const user of usersData) {
      user.password = await hashPassword(user.password);
    }

    await User.deleteMany({});
    await User.insertMany(usersData);
    console.log('Users seeded successfully!');
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    const dbUrl = process.env.MONGODB_URL;
    if (!dbUrl) throw new Error('MONGODB_URL not set in environment variables');

    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit process with failure
  }
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    await connectToDatabase();
    await dropDatabase();
    await seedUsers();
    console.log('--------------> Database seeding completed <--------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect().then(() => console.log('Disconnected from MongoDB'));
  }
};

// Execute seeding
seedDatabase();
