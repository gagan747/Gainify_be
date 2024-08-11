import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dbConnect from './dbConnect.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateSignup, validateLogin } from './middlewares/authPayloadValidation.js';
import authorizeUser from './middlewares/authorization.js';

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON bodies

// Use CORS middleware
app.use(cors({
 origin: ['https://gainify.vercel.app', 'http://localhost:3000'], // Specify the exact origin
 methods: ['GET', 'POST', 'PUT', 'DELETE'],
 allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
 exposedHeaders: ['x-auth-token'],
 credentials: true // Allow credentials if needed
}));

app.options('*', cors()); // Handle preflight requests

// Health check route
app.use('/server-health', (req, res, next) => {
 res.status(200).json({ message: 'Server is healthy...' });
});

// Generate JWT token
const generateToken = (userId) => {
 return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '100h' });
};

// Signup route
app.post('/api/signup', validateSignup, async (req, res) => {
 const { email, password, fullName } = req.body;

 try {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
   return res.status(400).json({ message: 'User already exists!!' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ email, password: hashedPassword, fullName });
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
  if (!user) return res.status(400).json({ message: 'User not Exists!!' });

  if (user && await bcrypt.compare(password, user.password)) {
   const token = generateToken(user._id);
   setTimeout(()=>{
    res.status(200).json({ message: 'Login successful', token });
   },5000)
   //res.status(200).json({ message: 'Login successful', token });
  } else {
   res.status(401).json({ message: 'Invalid credentials' });
  }
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
 }
});

// Protected route
app.get('/api/details', authorizeUser, async (req, res, next) => {
 res.status(200).json({ userDetails: req.user });
});

// Start the server
app.listen(PORT, async () => {
 await dbConnect();
 console.log('Db Connected Successfully');
 console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('uncaughtException',(err)=>{
 console.log(err)
})

process.on('unhandledRejection', (err) => {
 console.log(err)
})
