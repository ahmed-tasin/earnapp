const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  deposit,
  confirmDeposit,
  withdraw,
} = require("../controllers/paymentController");

const {
  createCheckout,
  verifyReturn,
} = require("../controllers/uddoktaPayController");

// UddoktaPay return callback
// এখানে authMiddleware দেওয়া যাবে না
router.get(
  "/uddoktapay/return",
  verifyReturn
);

// UddoktaPay checkout
router.post(
  "/uddoktapay/checkout",
  authMiddleware,
  createCheckout
);

// পুরোনো payment routes
router.post(
  "/deposit",
  authMiddleware,
  deposit
);

router.post(
  "/withdraw",
  authMiddleware,
  withdraw
);

router.post(
  "/confirm",
  authMiddleware,
  adminMiddleware,
  confirmDeposit
);

module.exports = router;