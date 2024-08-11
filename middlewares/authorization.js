// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Adjust the path as necessary

const authorizeUser = async (req, res, next) => {
 const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

 if (!token) {
  return res.status(401).json({ message: 'No token provided' });
 }

 try {
  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if user exists
  const user = await User.findById(decoded.id);
  if (!user) {
   return res.status(401).json({ message: 'User not found' });
  }

  // Attach user to request object
  req.user = user;
  next(); // Proceed to the next middleware or route handler
 } catch (error) {
  console.error(error);
  return res.status(401).json({ message: 'Invalid token' });
 }
};

export default authorizeUser;