const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { depositValidator, withdrawValidator } = require("../validators/walletValidator");
const {
  validateWithdraw,
} = require("../validators/withdrawValidator");
const walletController = require("../controllers/walletController");

const {
    deposit,
    approveDeposit,
    withdraw,
    approveWithdraw,
    rejectWithdraw,
    getTransactionHistory,
    getAllTransactions
} = require("../controllers/walletController");

// ================= DEPOSIT =================

// User Deposit Request
router.post(
    "/deposit",
    authMiddleware,
    depositValidator,
    deposit
);

// Admin Approve Deposit
router.put(
    "/deposit/:id/approve",
    authMiddleware,
    adminMiddleware,
    approveDeposit
);

// ================= WITHDRAW =================

// User Withdraw Request
router.post(
  "/withdraw",
  authMiddleware,
  validateWithdraw,
  walletController.withdraw,
);

// Admin Approve Withdraw
router.put(
    "/withdraw/:id/approve",
    authMiddleware,
    adminMiddleware,
    approveWithdraw
);

// Admin Reject Withdraw
router.put(
    "/withdraw/:id/reject",
    authMiddleware,
    adminMiddleware,
    rejectWithdraw
);

// USER HISTORY
router.get(
    "/history",
    authMiddleware,
    getTransactionHistory
);

// ADMIN HISTORY
router.get(
    "/admin/history",
    authMiddleware,
    adminMiddleware,
    getAllTransactions
);

module.exports = router;