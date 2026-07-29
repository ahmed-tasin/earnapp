const asyncHandler = require("../utils/asyncHandler");
const investmentService = require("../services/investmentService");

exports.getHoldings = asyncHandler(async (req, res) => {
  const holdings = await investmentService.getUserHoldings(
    req.user._id,
  );

  res.status(200).json({
    success: true,
    total: holdings.length,
    holdings,
  });
});

exports.claimProfit = asyncHandler(async (req, res) => {
  const result = await investmentService.claimProfit(
    req.user._id,
    req.params.investmentId,
  );

  res.status(200).json({
    success: true,
    message: `৳${result.profitAmount} profit claimed successfully`,
    ...result,
  });
});