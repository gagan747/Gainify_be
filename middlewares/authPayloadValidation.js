import Joi from 'joi';

// Joi validation schemas
const signupSchema = Joi.object({
 email: Joi.string().email().required(),
 password: Joi.string()
  .min(7) // Minimum length of 7 characters
  .required() // Required field
  .pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).+$')) // At least one uppercase letter, one number, and one special character
  .messages({
   'string.pattern.base': 'Password must contain at least one uppercase letter, one number, and one special character.'
  }),
  fullName: Joi.string()
});

const loginSchema = Joi.object({
 email: Joi.string().email().required(),
 password: Joi.string().required()
});

// Middleware for signup validation
export const validateSignup = (req, res, next) => {
 const { error } = signupSchema.validate(req.body);
 if (error) {
  return res.status(400).json({ message: error.details[0].message });
 }
 next();
};

// Middleware for login validation
export const validateLogin = (req, res, next) => {
 const { error } = loginSchema.validate(req.body);
 if (error) {
  return res.status(400).json({ message: error.details[0].message });
 }
 next();
};