const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    dailyCheckin
} = require("../controllers/checkinController");

router.post("/", authMiddleware, dailyCheckin);

module.exports = router;