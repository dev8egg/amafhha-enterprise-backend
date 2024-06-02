const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = mongoose.model("User");
module.exports = () => {
  return asyncHandler(async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        throw new ApiError(401, "Unauthorized");
      }
      const token = authorization.replace("Bearer ", "");
      const decodedToken = jwt.verify(token, process.env.secret_Key);
      const user = await User.findById(decodedToken?.userId);
      if (!user) {
        throw new ApiError(401, "User not found");
      } else if (user?.isDeleted) {
        throw new ApiError(401, "Account is deleted");
      } else {
        req.user = user;
        next();
      }
    } catch (error) {
      throw new ApiError(401, error?.message || "Unauthorized");
    }
  });
};
