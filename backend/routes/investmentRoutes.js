const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const investmentController = require(
  "../controllers/investmentController",
);

const router = express.Router();

router.use(authMiddleware);

router.get("/holdings", investmentController.getHoldings);
router.post(
  "/:investmentId/claim",
  investmentController.claimProfit,
);

module.exports = router;