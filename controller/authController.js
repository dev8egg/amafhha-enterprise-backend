const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const signUp = asyncHandler(async (req, res) => {
  const { fullName, address, email, password } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const user = new User({
    email: email,
    fullName: fullName,
    address: address,
    password,
    image: req.file?.path,
    otp: otp,
  });
  await user.save();
  return res.status(201).send({ status: 1, message: "OTP verification code has been sent to your email address.", data: { _id: user._id } });
});

const resendOTP = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new ApiError(404, "User not found");
  } else {
    user.otp = otp;
    await user.save();
    return res.status(200).send({ status: 1, message: "We have resend OTP verification code at your email address", data: { _id: user._id } });
  }
});

const verifyAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).send({ status: 0, message: "OTP field can't be empty." });
  } else {
    const user = await User.findOne({ _id: id });
    if (!user) {
      throw new ApiError(404, "User not found");
    } else {
      if (otp != user.otp) {
        throw new ApiError(400, "Invalid OTP verification code.");
      } else {
        if (!user.isForgot) {
          await user.generateAuthToken();
        }
        user.isVerified = true;
        user.save();
        return res.status(200).send({ status: 1, message: "Account verified successfully", data: user });
      }
    }
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(404, "User not found");
  } else {
    user.otp = otp;
    user.token = null;
    user.isForgot = true;
    user.isVerified = false;
    await user.save();
    return res.status(200).send({ status: 1, message: "OTP verification code has been sent to your email.", data: { _id: user._id } });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new ApiError(404, "User not found");
  } else if (!user.isVerified) {
    throw new ApiError(400, "Verify your account");
  } else {
    user.password = password;
    user.isForgot = false;
    await user.save();
    res.status(200).send({ status: 1, message: "Password changed successfully", data: user });
  }
});

const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(400, "Invalid password");
  } else if (user?.isDeleted) {
    throw new ApiError(400, "Account is deleted", user);
  } else if (!user.isVerified) {
    throw new ApiError(400, "User is not verified", user);
  } else {
    await user.generateAuthToken();
    await user.save();
    res.status(200).send({ status: 1, message: "Login successfully", data: user });
  }
});

const myProfile = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: { $eq: req.user._id },
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: "galleries",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [{ $eq: ["$userId", "$$userId"] }],
                  },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              image: 1,
              isPrivate: 1,
            },
          },
        ],
        as: "gallery",
      },
    },
  ]);
  if (user?.length > 0) {
    return res.status(200).send({ status: 1, data: user[0] });
  } else {
    throw new ApiError(404, "User not found");
  }
});

const editProfile = asyncHandler(async (req, res) => {
  const { fullName, address } = req.body;
  const user = await User.findOne({ _id: req.user._id });
  user.fullName = fullName ? fullName : req.user.fullName;
  user.address = address ? address : req.user.address;
  user.image = req.file ? req.file?.path : req.user.image;
  await user.save();
  return res.status(200).send({ status: 1, message: "Profile updated successfully", data: user });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { existingPassword, newPassword } = req.body;
  if (!existingPassword) {
    throw new ApiError(400, "Current password field can't be empty");
  }
  const user = await User.findOne({ _id: req.user._id });
  const isMatch = await bcrypt.compare(existingPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, "Invalid current password");
  } else if (existingPassword == newPassword) {
    throw new ApiError(400, "Current password and new password can't be same");
  } else {
    await user.comparePassword(existingPassword);
    user.password = newPassword;
    await user.save();
    return res.status(200).send({ status: 1, message: "Password changed successfully" });
  }
});

const signOut = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  user.token = null;
  user.save();
  res.status(200).send({ status: 1, message: "Logout successfully" });
});
module.exports = { signUp, resendOTP, verifyAccount, forgetPassword, resetPassword, signIn, updatePassword, editProfile, myProfile, signOut };
