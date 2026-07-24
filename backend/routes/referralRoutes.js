const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


const {
    getReferralInfo
} = require("../controllers/referralController");

const {
    getReferralHistory
} = require("../controllers/referralController");

const {
    getReferralSummary
} = require("../controllers/referralController");

router.get("/info", authMiddleware, getReferralInfo);

router.get("/history", authMiddleware, getReferralHistory);

router.get("/summary", authMiddleware, getReferralSummary);

module.exports = router;