const mongoose = require('mongoose');
const path = require('path');

// Load .env explicitly from the backend folder — fixes "undefined" URI error
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error(
        'MONGO_URI is undefined. Make sure your .env file exists inside the backend/ folder and contains MONGO_URI.'
      );
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;