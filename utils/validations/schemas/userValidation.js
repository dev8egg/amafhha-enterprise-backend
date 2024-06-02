const mongoose = require("mongoose");
const User = mongoose.model("User");
const Joi = require("joi");

const isEmailTaken = async (email) => {
  const user = await User.findOne({ email });
  return !!user;
};

const emailExistenceCheck = async (value, helpers) => {
  const emailTaken = await isEmailTaken(value);
  if (emailTaken) {
    return helpers.message("Email already exists");
  }
  return value;
};
const userSchema = {
  register: Joi.object({
    fullName: Joi.string().min(3).max(30).required().messages({
      "string.base": "Full name should be a type of text",
      "string.empty": "Full name cannot be an empty field",
      "string.min": "Full name should have a minimum length of {#limit} characters",
      "string.max": "Full name should have a maximum length of {#limit} characters",
      "any.required": "Full name is a required field",
    }),
    email: Joi.string().email().lowercase().required().external(emailExistenceCheck).messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email cannot be an empty field",
      "any.required": "Email is required",
    }),
    password: Joi.string().pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])")).min(6).required().messages({
      "string.pattern.base": "Password must contain at least one uppercase letter, one number, and one symbol",
      "string.min": "Password should have a minimum length of {#limit} characters",
      "any.required": "Password is required",
      "string.empty": "Password cannot be an empty field",
    }),
    address: Joi.string().min(3).max(30).required().messages({
      "string.base": "Address should be a type of text",
      "string.empty": "Address cannot be an empty field",
      "string.min": "Address should have a minimum length of {#limit} characters",
      "string.max": "Address should have a maximum length of {#limit} characters",
      "any.required": "Address is a required field",
    }),
  }),

  verifyOTP: Joi.object({
    otp: Joi.string().min(6).max(6).required().messages({
      "string.base": "OTP should be a type of text",
      "string.empty": "OTP cannot be an empty field",
      "string.min": "OTP should have a minimum length of {#limit} characters",
      "string.max": "OTP should have a maximum length of {#limit} characters",
      "any.required": "OTP is a required field",
    }),
  }),

  forgetPassword: Joi.object({
    email: Joi.string().email().lowercase().required().messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email cannot be an empty field",
      "any.required": "Email is required",
    }),
  }),

  resetPassword: Joi.object({
    password: Joi.string().pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])")).min(6).required().messages({
      "string.pattern.base": "Password must contain at least one uppercase letter, one number, and one symbol",
      "string.min": "Password should have a minimum length of {#limit} characters",
      "any.required": "Password is required",
      "string.empty": "Password cannot be an empty field",
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().required().messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email cannot be an empty field",
      "any.required": "Email is required",
    }),
    password: Joi.string().pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])")).min(6).required().messages({
      "string.pattern.base": "Password must contain at least one uppercase letter, one number, and one symbol",
      "string.min": "Password should have a minimum length of {#limit} characters",
      "any.required": "Password is required",
      "string.empty": "Password cannot be an empty field",
    }),
  }),

  updatePassword: Joi.object({
    existingPassword: Joi.string().pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])")).min(6).required().messages({
      "string.pattern.base": "Current Password must contain at least one uppercase letter, one number, and one symbol",
      "string.min": "Current Password should have a minimum length of {#limit} characters",
      "any.required": "Current Password is required",
      "string.empty": "Current Password cannot be an empty field",
    }),
    newPassword: Joi.string().pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])")).min(6).required().messages({
      "string.pattern.base": "New Password must contain at least one uppercase letter, one number, and one symbol",
      "string.min": "New Password should have a minimum length of {#limit} characters",
      "any.required": "New Password is required",
      "string.empty": "New Password cannot be an empty field",
    }),
  }),

  editProfile: Joi.object({
    fullName: Joi.string().max(30).messages({
      "string.base": "Full name should be a type of text",
      "string.max": "Full name should have a maximum length of {#limit} characters",
    }),
    address: Joi.string().max(30).messages({
      "string.base": "Address should be a type of text",
      "string.max": "Address should have a maximum length of {#limit} characters",
    }),
  }),
};

module.exports = userSchema;
