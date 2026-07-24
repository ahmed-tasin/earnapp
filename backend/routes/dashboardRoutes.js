const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getUserDashboard
} = require("../controllers/dashboardController");

// ================= USER DASHBOARD =================

router.get(
    "/",
    authMiddleware,
    getUserDashboard
);

module.exports = router;