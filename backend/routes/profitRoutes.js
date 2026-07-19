const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const profitService = require("../services/profitService");

router.post(
    "/run",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        const result = await profitService.runDailyProfit();

        res.json(result);

    }
);

module.exports = router;