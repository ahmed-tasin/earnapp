const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getReferralInfo
} = require("../controllers/referralController");

router.get("/info", authMiddleware, getReferralInfo);

module.exports = router;