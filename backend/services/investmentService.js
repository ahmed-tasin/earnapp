const mongoose = require("mongoose");

const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const notificationService = require("./notificationService");

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

// Bangladesh date এবং পরবর্তী রাত ১২টা বের করবে
const getDhakaDayInfo = (date = new Date()) => {
  const shiftedDate = new Date(
    date.getTime() + DHAKA_OFFSET_MS
  );

  const profitDate = shiftedDate
    .toISOString()
    .slice(0, 10);

  const nextDhakaMidnight = new Date(
    Date.UTC(
      shiftedDate.getUTCFullYear(),
      shiftedDate.getUTCMonth(),
      shiftedDate.getUTCDate() + 1
    ) - DHAKA_OFFSET_MS
  );

  return {
    profitDate,
    nextDhakaMidnight,
  };
};

// Frontend-এর জন্য holding data তৈরি করবে
const toHolding = (
  investment,
  claimedToday = false,
  now = new Date()
) => {
  const { nextDhakaMidnight } =
    getDhakaDayInfo(now);

  const isActive =
    investment.status === "active" &&
    Number(investment.remainingDays || 0) > 0;

  return {
    _id: investment._id,

    package: investment.packageId,

    investmentAmount:
      investment.investmentAmount,

    dailyReturn:
      investment.dailyReturn,

    totalDays:
      investment.totalDays,

    remainingDays:
      investment.remainingDays,

    totalEarned:
      investment.totalEarned,

    startDate:
      investment.startDate,

    endDate:
      investment.endDate,

    lastProfitDate:
      investment.lastProfitDate,

    nextClaimAt: claimedToday
      ? nextDhakaMidnight
      : now,

    status:
      investment.status,

    claimedToday,

    canClaim:
      isActive && !claimedToday,

    millisecondsUntilClaim:
      isActive && claimedToday
        ? Math.max(
            nextDhakaMidnight.getTime() -
              now.getTime(),
            0
          )
        : 0,
  };
};

// User-এর সব holding দেখাবে
exports.getUserHoldings = async (userId) => {
  const now = new Date();

  const { profitDate } =
    getDhakaDayInfo(now);

  const investments =
    await Investment.find({
      userId,
    })
      .populate(
        "packageId",
        "name amount dailyReturn totalDays status"
      )
      .sort({
        createdAt: -1,
      });

  const investmentIds =
    investments.map(
      (investment) => investment._id
    );

  // আজ কোন investment-এর profit claim হয়েছে
  const claimedTransactions =
    await Transaction.find({
      userId,

      investmentId: {
        $in: investmentIds,
      },

      type: "profit",

      profitDate,
    }).select("investmentId");

  const claimedInvestmentIds =
    new Set(
      claimedTransactions.map(
        (transaction) =>
          transaction.investmentId.toString()
      )
    );

  return investments.map(
    (investment) => {
      const claimedToday =
        claimedInvestmentIds.has(
          investment._id.toString()
        );

      return toHolding(
        investment,
        claimedToday,
        now
      );
    }
  );
};

// Daily profit claim করবে
exports.claimProfit = async (
  userId,
  investmentId
) => {
  if (
    !mongoose.isValidObjectId(
      investmentId
    )
  ) {
    const error = new Error(
      "Invalid holding ID"
    );

    error.statusCode = 400;

    throw error;
  }

  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const investment =
      await Investment.findOne({
        _id: investmentId,
        userId,
      }).session(session);

    if (!investment) {
      const error = new Error(
        "Holding not found"
      );

      error.statusCode = 404;

      throw error;
    }

    if (
      investment.status !== "active" ||
      Number(
        investment.remainingDays || 0
      ) <= 0
    ) {
      const error = new Error(
        "This holding is already completed"
      );

      error.statusCode = 400;

      throw error;
    }

    const now = new Date();

    const {
      profitDate,
      nextDhakaMidnight,
    } = getDhakaDayInfo(now);

    // একই দিনে দ্বিতীয়বার claim আটকাবে
    const alreadyClaimed =
      await Transaction.findOne({
        userId,

        investmentId:
          investment._id,

        type: "profit",

        profitDate,
      }).session(session);

    if (alreadyClaimed) {
      const error = new Error(
        "Today's profit has already been claimed"
      );

      error.statusCode = 429;

      error.nextClaimAt =
        nextDhakaMidnight;

      throw error;
    }

    const profitAmount = Number(
      investment.dailyReturn
    );

    if (
      !Number.isFinite(
        profitAmount
      ) ||
      profitAmount <= 0
    ) {
      const error = new Error(
        "Invalid daily profit amount"
      );

      error.statusCode = 400;

      throw error;
    }

    const claimSequence =
      Number(
        investment.totalDays || 0
      ) -
      Number(
        investment.remainingDays || 0
      ) +
      1;

    const user =
      await User.findById(
        userId
      ).session(session);

    if (!user) {
      const error = new Error(
        "User not found"
      );

      error.statusCode = 404;

      throw error;
    }

    let profitTransaction;

    try {
      [profitTransaction] =
        await Transaction.create(
          [
            {
              userId:
                user._id,

              investmentId:
                investment._id,

              type:
                "profit",

              amount:
                profitAmount,

              profitDate,

              claimSequence,

              note:
                "Claimed holding profit",

              status:
                "approved",
            },
          ],
          {
            session,
          }
        );
    } catch (error) {
      if (error.code === 11000) {
        const duplicateError =
          new Error(
            "This profit has already been claimed"
          );

        duplicateError.statusCode =
          409;

        throw duplicateError;
      }

      throw error;
    }

    // Wallet balance update
    user.balance =
      Number(user.balance || 0) +
      profitAmount;

    user.totalEarning =
      Number(
        user.totalEarning || 0
      ) +
      profitAmount;

    await user.save({
      session,
    });

    // Investment update
    investment.totalEarned =
      Number(
        investment.totalEarned || 0
      ) +
      profitAmount;

    investment.remainingDays =
      Math.max(
        Number(
          investment.remainingDays || 0
        ) - 1,
        0
      );

    investment.lastProfitDate =
      now;

    if (
      investment.remainingDays === 0
    ) {
      investment.status =
        "completed";

      investment.completedAt =
        now;

      investment.nextClaimAt =
        null;
    } else {
      investment.nextClaimAt =
        nextDhakaMidnight;
    }

    await investment.save({
      session,
    });

    await notificationService
      .createNotification(
        user._id,

        "Profit Claimed",

        `You claimed ৳${profitAmount} profit from your holding.`,

        "profit",

        session
      );

    await session.commitTransaction();

    return {
      profitAmount,

      balance:
        user.balance,

      transactionId:
        profitTransaction._id,

      holding:
        toHolding(
          investment,
          true,
          now
        ),
    };
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session
        .abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};