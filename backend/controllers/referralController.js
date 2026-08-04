const User = require("../models/User");
const ReferralCommission = require("../models/ReferralCommission");
const referralService = require("../services/referralService");
const asyncHandler = require("../utils/asyncHandler");

exports.getReferralInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const directReferrals = await User.find(
      {
        $or: [
          { referredBy: user._id },
          { _id: { $in: user.directReferrals || [] } },
        ],
      },
      "name username status createdAt",
    )
      .sort({ createdAt: -1 })
      .lean();

    const level2Referrals = await User.find(
      { referredBy: { $in: directReferrals.map((member) => member._id) } },
      "name username status createdAt",
    )
      .sort({ createdAt: -1 })
      .lean();

    const level3Referrals = await User.find(
      { referredBy: { $in: level2Referrals.map((member) => member._id) } },
      "name username status createdAt",
    )
      .sort({ createdAt: -1 })
      .lean();

    const commissions = await ReferralCommission.find({
      fromUser: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      referralCode: user.referralCode,

      referralLink: `${(
        process.env.FRONTEND_URL || "http://localhost:3000"
      ).replace(/\/$/, "")}/register?ref=${encodeURIComponent(
        user.referralCode,
      )}`,

      totalCommission: user.referralCommissionEarned || 0,
      directReferrals,
      totalReferrals: directReferrals.length,

      referralLevels: {
        level1: directReferrals,
        level2: level2Referrals,
        level3: level3Referrals,
      },

      commissions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getReferralHistory = asyncHandler(async (req, res) => {
  const result = await referralService.getReferralHistory(req.user.id);

  res.json({
    success: true,
    ...result,
  });
});

exports.getReferralSummary = asyncHandler(async (req, res) => {
  const summary = await referralService.getReferralSummary(req.user.id);

  res.json({
    success: true,
    summary,
  });
});