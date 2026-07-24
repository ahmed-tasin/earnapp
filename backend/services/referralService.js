const User = require("../models/User");
const ReferralCommission = require("../models/ReferralCommission");
const Transaction = require("../models/Transaction");

const { REFERRAL_COMMISSION_PERCENT } = require("../config/constants");

exports.payReferralCommission = async (buyerId, packageAmount, session) => {
  const buyer = await User.findById(buyerId).session(session);

  if (!buyer) return;

  if (!buyer.referredBy) return;

  const referrer = await User.findById(buyer.referredBy).session(session);

  if (!referrer) return;

  const commission = (packageAmount * REFERRAL_COMMISSION_PERCENT) / 100;

  // Referrer Balance Update
  referrer.balance += commission;
  referrer.referralCommissionEarned += commission;

  // Save the referrer with the session

  await referrer.save({ session });

  await notificationService.createNotification(
    referrer._id,
    "Referral Commission",
    `You received ৳${commission} referral commission from ${buyer.username}.`,
    "referral",
    session,
  );

  // Referral History
  await ReferralCommission.create(
    [
      {
        fromUser: referrer._id,
        toUser: buyer._id,
        commission: commission,
        level: 1,
        transactionAmount: packageAmount,
        status: "completed",
      },
    ],
    { session },
  );

  // Transaction History
  await Transaction.create(
    [
      {
        userId: referrer._id,

        type: "referral",

        amount: commission,

        paymentMethod: "",

        trxId: "",

        note: `Referral commission from ${buyer.username}`,

        status: "approved",
      },
    ],
    { session },
  );
};

// ================= REFERRAL HISTORY =================

exports.getReferralHistory = async (userId) => {
  const history = await ReferralCommission.find({
    fromUser: userId,
  })
    .populate("toUser", "username email phone")
    .sort({ createdAt: -1 });

  const totalCommission = history.reduce(
    (sum, item) => sum + item.commission,
    0,
  );

  return {
    totalCommission,

    totalReferrals: history.length,

    history,
  };
};

// ================= REFERRAL SUMMARY =================

exports.getReferralSummary = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  const referrals = await User.find(
    {
      referredBy: userId,
    },
    "username email createdAt",
  ).sort({ createdAt: -1 });

  const totalCommission = await ReferralCommission.aggregate([
    {
      $match: {
        fromUser: user._id,
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$commission",
        },
      },
    },
  ]);

  return {
    referralCode: user.referralCode,

    totalReferrals: referrals.length,

    totalCommission: totalCommission.length > 0 ? totalCommission[0].total : 0,

    recentReferrals: referrals.slice(0, 10),
  };
};
