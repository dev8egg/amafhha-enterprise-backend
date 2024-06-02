const express = require("express");
const router = express.Router();
const { signUp, resendOTP, verifyAccount, forgetPassword, resetPassword, signIn, updatePassword, editProfile, signOut, myProfile } = require("../controller/authController");
const { upload } = require("../middleware/multer");
const authCommon = require("../middleware/authCommon");
const { userValidation } = require("../utils/validations");
const validate = require("../utils/validations/validator");

router.post("/api/signUp", upload.single("profileImage"), validate(userValidation.register), signUp);
router.post("/api/resendOTP/:id", resendOTP);
router.post("/api/verifyAccount/:id", validate(userValidation.verifyOTP), verifyAccount);
router.post("/api/forgetPassword", validate(userValidation.forgetPassword), forgetPassword);
router.post("/api/resetPassword/:id", validate(userValidation.resetPassword), resetPassword);
router.post("/api/login", validate(userValidation.login), signIn);
router.patch("/api/updatePassword", authCommon(), validate(userValidation.updatePassword), updatePassword);
router.patch("/api/editProfile", authCommon(), upload.single("profileImage"), validate(userValidation.editProfile), editProfile);
router.get("/api/myProfile", authCommon(), myProfile);
router.post("/api/signOut", authCommon(), signOut);

module.exports = router;
