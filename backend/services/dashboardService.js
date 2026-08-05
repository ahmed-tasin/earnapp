const User = require("../models/User");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

const getDhakaDate = (daysAgo = 0) => {
  const dhakaDate = new Date(Date.now() + DHAKA_OFFSET_MS);

  dhakaDate.setUTCDate(
    dhakaDate.getUTCDate() - Number(daysAgo || 0),
  );

  return dhakaDate.toISOString().slice(0, 10);
};

exports.getUserDashboard = async (userId) => {
  const user = await User.findById(userId)
    .select(
      "balance totalDeposit totalWithdraw totalEarning referralCommissionEarned",
    )
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  const today = getDhakaDate();
  const previousDay = getDhakaDate(1);

  const [
    activeInvestments,
    completedInvestments,
    pendingDeposits,
    pendingWithdraws,
    profitTransactions,
    todayProfitTransactions,
    previousProfitTransactions,
  ] = await Promise.all([
    Investment.countDocuments({
      userId,
      status: "active",
    }),

    Investment.countDocuments({
      userId,
      status: "completed",
    }),

    Transaction.countDocuments({
      userId,
      type: "deposit",
      status: "pending",
    }),

    Transaction.countDocuments({
      userId,
      type: "withdraw",
      status: "pending",
    }),

    Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          type: "profit",
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),

    Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          type: "profit",
          status: "approved",
          profitDate: today,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),

    Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          type: "profit",
          status: "approved",
          profitDate: previousDay,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  return {
    balance: user.balance || 0,
    totalDeposit: user.totalDeposit || 0,
    totalWithdraw: user.totalWithdraw || 0,
    totalEarning: user.totalEarning || 0,
    referralCommission: user.referralCommissionEarned || 0,

    activeInvestments,
    completedInvestments,
    pendingDeposits,
    pendingWithdraws,

    totalProfit: profitTransactions[0]?.total || 0,
    todayEarning: todayProfitTransactions[0]?.total || 0,
    previousEarning: previousProfitTransactions[0]?.total || 0,
  };
};