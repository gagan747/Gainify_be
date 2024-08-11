// lib/dbConnect.js
import mongoose from 'mongoose';

const connection = {}; // Connection cache

async function dbConnect() {
 if (connection.isConnected) {
  return; // Use existing connection
 }

 // Connect to MongoDB
 await mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 });

 connection.isConnected = mongoose.connection.readyState;
}

export default dbConnect;
