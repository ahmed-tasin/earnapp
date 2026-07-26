const express = require("express");

const {
  getCheckin,
  dailyCheckin,
  getCheckinHistory,
} = require("../controllers/checkinController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();



router.get("/", authMiddleware, getCheckin);
router.post("/", authMiddleware, dailyCheckin);
router.get("/history", authMiddleware, getCheckinHistory);

module.exports = router;