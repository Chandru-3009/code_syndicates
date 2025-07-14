import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

const complexityOptions = {
  min: 8,
  max: 30,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 4,
};

export const signupSchema = Joi.object({
  email: Joi.string().email().required().label("Email").messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: passwordComplexity(complexityOptions).required().label("Password").messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
  name: Joi.string().min(2).max(100).optional().label("Name").messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().label("Email").messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().label("Password").messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});
