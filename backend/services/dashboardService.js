const User = require("../models/User");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");

exports.getUserDashboard = async (userId) => {

    const user = await User.findById(userId);

    if (!user)
        throw new Error("User not found");

    const activeInvestments = await Investment.countDocuments({
        userId,
        status: "active"
    });

    const completedInvestments = await Investment.countDocuments({
        userId,
        status: "completed"
    });

    const pendingDeposits = await Transaction.countDocuments({
        userId,
        type: "deposit",
        status: "pending"
    });

    const pendingWithdraws = await Transaction.countDocuments({
        userId,
        type: "withdraw",
        status: "pending"
    });

    const profitTransactions = await Transaction.aggregate([
        {
            $match: {
                userId: user._id,
                type: "profit",
                status: "approved"
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount"
                }
            }
        }
    ]);

    return {

        balance: user.balance,

        totalDeposit: user.totalDeposit,

        totalWithdraw: user.totalWithdraw,

        totalEarning: user.totalEarning,

        referralCommission: user.referralCommissionEarned,

        activeInvestments,

        completedInvestments,

        pendingDeposits,

        pendingWithdraws,

        totalProfit:
            profitTransactions.length > 0
                ? profitTransactions[0].total
                : 0

    };

};