const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  updateWithdrawalAccount,
  changePassword,
} = require("../controllers/userController");

router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, updateProfile);

router.put(
  "/withdrawal-account",
  authMiddleware,
  updateWithdrawalAccount
);

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;