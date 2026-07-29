const mongoose = require("mongoose");

const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const notificationService = require("./notificationService");

const CLAIM_INTERVAL_MS = 24 * 60 * 60 * 1000;

const getNextClaimAt = (investment) => {
  if (investment.nextClaimAt) {
    return new Date(investment.nextClaimAt);
  }

  const lastClaim = investment.lastProfitDate
    ? new Date(investment.lastProfitDate)
    : new Date(investment.startDate || investment.createdAt);

  return new Date(lastClaim.getTime() + CLAIM_INTERVAL_MS);
};

const toHolding = (investment, now = new Date()) => {
  const nextClaimAt = getNextClaimAt(investment);

  const isActive =
    investment.status === "active" &&
    Number(investment.remainingDays || 0) > 0;

  return {
    _id: investment._id,
    package: investment.packageId,
    investmentAmount: investment.investmentAmount,
    dailyReturn: investment.dailyReturn,
    totalDays: investment.totalDays,
    remainingDays: investment.remainingDays,
    totalEarned: investment.totalEarned,
    startDate: investment.startDate,
    endDate: investment.endDate,
    lastProfitDate: investment.lastProfitDate,
    nextClaimAt,
    status: investment.status,

    canClaim:
      isActive &&
      nextClaimAt.getTime() <= now.getTime(),

    millisecondsUntilClaim: isActive
      ? Math.max(
          nextClaimAt.getTime() - now.getTime(),
          0
        )
      : 0,
  };
};

exports.getUserHoldings = async (userId) => {
  const investments = await Investment.find({
    userId,
  })
    .populate(
      "packageId",
      "name amount dailyReturn totalDays status"
    )
    .sort({
      createdAt: -1,
    });

  return investments.map((investment) =>
    toHolding(investment)
  );
};

exports.claimProfit = async (
  userId,
  investmentId
) => {
  if (!mongoose.isValidObjectId(investmentId)) {
    const error = new Error("Invalid holding ID");
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const investment = await Investment.findOne({
      _id: investmentId,
      userId,
    }).session(session);

    if (!investment) {
      const error = new Error("Holding not found");
      error.statusCode = 404;
      throw error;
    }

    if (
      investment.status !== "active" ||
      Number(investment.remainingDays || 0) <= 0
    ) {
      const error = new Error(
        "This holding is already completed"
      );

      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    const nextClaimAt = getNextClaimAt(investment);

    if (now.getTime() < nextClaimAt.getTime()) {
      const error = new Error(
        "Profit is not ready to claim yet"
      );

      error.statusCode = 429;
      error.nextClaimAt = nextClaimAt;

      throw error;
    }

    const profitAmount = Number(
      investment.dailyReturn
    );

    if (
      !Number.isFinite(profitAmount) ||
      profitAmount <= 0
    ) {
      const error = new Error(
        "Invalid daily profit amount"
      );

      error.statusCode = 400;
      throw error;
    }

    const claimSequence =
      Number(investment.totalDays || 0) -
      Number(investment.remainingDays || 0) +
      1;

    const user = await User.findById(
      userId
    ).session(session);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    let profitTransaction;

    try {
      [profitTransaction] =
        await Transaction.create(
          [
            {
              userId: user._id,
              investmentId: investment._id,
              type: "profit",
              amount: profitAmount,

              profitDate: now
                .toISOString()
                .slice(0, 10),

              claimSequence,
              note: "Claimed holding profit",
              status: "approved",
            },
          ],
          {
            session,
          }
        );
    } catch (error) {
      if (error.code === 11000) {
        const duplicateError = new Error(
          "This profit has already been claimed"
        );

        duplicateError.statusCode = 409;
        throw duplicateError;
      }

      throw error;
    }

    user.balance =
      Number(user.balance || 0) +
      profitAmount;

    user.totalEarning =
      Number(user.totalEarning || 0) +
      profitAmount;

    await user.save({
      session,
    });

    investment.totalEarned =
      Number(investment.totalEarned || 0) +
      profitAmount;

    investment.remainingDays = Math.max(
      Number(investment.remainingDays || 0) - 1,
      0
    );

    investment.lastProfitDate = now;

    if (investment.remainingDays === 0) {
      investment.status = "completed";
      investment.completedAt = now;
      investment.nextClaimAt = null;
    } else {
      investment.nextClaimAt = new Date(
        now.getTime() + CLAIM_INTERVAL_MS
      );
    }

    await investment.save({
      session,
    });

    await notificationService.createNotification(
      user._id,
      "Profit Claimed",
      `You claimed ৳${profitAmount} profit from your holding.`,
      "profit",
      session
    );

    await session.commitTransaction();

    return {
      profitAmount,
      balance: user.balance,
      transactionId: profitTransaction._id,
      holding: toHolding(investment, now),
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};