const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {

    deposit,

    confirmDeposit,

    withdraw

} = require("../controllers/paymentController");

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

// Admin Only
router.post(
    "/confirm",
    authMiddleware,
    adminMiddleware,
    confirmDeposit
);

module.exports = router;