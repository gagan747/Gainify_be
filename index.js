// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dbConnect from './dbConnect.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateSignup, validateLogin } from './middlewares/authPayloadValidation.js'; // Import validation middleware
import authorizeUser from './middlewares/authorization.js';

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON bodies

app.use(cors());

app.use('/server-health',(req,res, next)=>{
 res.status(200).json({ message: 'Server is healthy...' });
})

const generateToken = (userId) => {
 return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '100h' });
};

// Signup route
app.post('/api/signup', validateSignup, async (req, res) => {
 const { email, password, fullName } = req.body;

 try {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
   return res.status(400).json({ message: 'User already exists!!' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = await User.create({ email, password: hashedPassword, fullName });

  // Generate JWT token
  const token = generateToken(newUser._id);

  res.status(201).json({ message: 'User created successfully!!', token });
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
 }
});

// Login route
app.post('/api/login', validateLogin, async (req, res) => {
 const { email, password } = req.body;

 try {
  const user = await User.findOne({ email });

  if(!user)
   return res.status(400).json({ message: 'User not Exists!!' });

  if (user && await bcrypt.compare(password, user.password)) {
   // Generate JWT token
   const token = generateToken(user._id);
   res.status(200).json({ message: 'Login successful', token });
  } else {
   res.status(401).json({ message: 'Invalid credentials' });
  }
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
 }
});

app.use(authorizeUser);

app.get('/api/details', async(req, res, next) => {
 res.status(200).json({userDetails: req.user})
})
// Start the server
app.listen(PORT, async () => {
 await dbConnect();
 console.log('Db Connected Successfully');
 console.log(`Server is running on http://localhost:${PORT}`);
});