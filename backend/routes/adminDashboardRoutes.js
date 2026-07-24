const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const walletService = require("../services/walletService");
const profitService = require("../services/profitService");

const {
  getAdminDashboard,
  getUsers,
  getUserDetails,
  suspendUser,
  activateUser,
  updateUser,
} = require("../controllers/adminDashboardController");







router.get("/dashboard", authMiddleware, adminMiddleware, getAdminDashboard);

router.get("/users", authMiddleware, adminMiddleware, getUsers);

router.patch(
  "/users/:id/suspend",
  authMiddleware,
  adminMiddleware,
  suspendUser,
);

router.patch(
  "/users/:id/activate",
  authMiddleware,
  adminMiddleware,
  activateUser,
);

router.patch("/users/:id", authMiddleware, adminMiddleware, updateUser);

router.get("/users/:id", authMiddleware, adminMiddleware, getUserDetails);

router.post(
  "/run-daily-profit",
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const result = await profitService.runDailyProfit();

    res.status(200).json(result);
  }),
);

router.patch(
  "/withdraws/:transactionId/approve",
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const transaction = await walletService.approveWithdraw(
      req.params.transactionId,
    );

    res.status(200).json({
      success: true,
      message: "Withdraw approved successfully",
      transaction,
    });
  }),
);

router.patch(
  "/withdraws/:transactionId/reject",
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const transaction = await walletService.rejectWithdraw(
      req.params.transactionId,
    );

    res.status(200).json({
      success: true,
      message: "Withdraw rejected successfully",
      transaction,
    });
  }),
);

// ================= GET ALL DEPOSITS =================

router.get(
  "/deposits",
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const deposits =
      await walletService.getAdminDeposits();

    res.status(200).json({
      success: true,
      total: deposits.length,
      deposits,
    });
  }),
);

// ================= APPROVE DEPOSIT =================

router.patch(
  "/deposits/:transactionId/approve",
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const transaction =
      await walletService.approveDeposit(
        req.params.transactionId,
      );

    res.status(200).json({
      success: true,
      message:
        "Deposit approved successfully",
      transaction,
    });
  }),
);

// ================= REJECT DEPOSIT =================

router.patch(
  "/deposits/:transactionId/reject",
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const transaction =
      await walletService.rejectDeposit(
        req.params.transactionId,
      );

    res.status(200).json({
      success: true,
      message:
        "Deposit rejected successfully",
      transaction,
    });
  }),
);

// ================= GET ALL WITHDRAWS =================

router.get(
  "/withdraws",
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const withdraws =
      await walletService.getAdminWithdraws();

    res.status(200).json({
      success: true,
      total: withdraws.length,
      withdraws,
    });
  }),
);


module.exports = router;
