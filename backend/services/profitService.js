const mongoose = require("mongoose");

const User = require("../models/User");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");
const notificationService = require("./notificationService");

// ================= DATE HELPERS =================

const getDhakaDateParts = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === "year",
  ).value;

  const month = parts.find(
    (part) => part.type === "month",
  ).value;

  const day = parts.find(
    (part) => part.type === "day",
  ).value;

  return {
    profitDate: `${year}-${month}-${day}`,
  };
};

// ================= PROCESS ONE INVESTMENT =================

const processSingleInvestment = async (
  investmentId,
  profitDate,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const investment = await Investment.findOne({
      _id: investmentId,
      status: "active",
      remainingDays: {
        $gt: 0,
      },
    }).session(session);

    if (!investment) {
      await session.abortTransaction();

      return {
        processed: false,
        reason: "Investment inactive or completed",
      };
    }

    const existingProfit =
      await Transaction.findOne({
        investmentId: investment._id,
        type: "profit",
        profitDate,
      }).session(session);

    if (existingProfit) {
      await session.abortTransaction();

      return {
        processed: false,
        reason: "Profit already processed today",
      };
    }

    const profitAmount = Number(
      investment.dailyReturn,
    );

    if (
      !Number.isFinite(profitAmount) ||
      profitAmount <= 0
    ) {
      throw new Error(
        "Invalid investment daily return",
      );
    }

    const user = await User.findById(
      investment.userId,
    ).session(session);

    if (!user) {
      throw new Error("User not found");
    }

    /*
     * আগে transaction create করা হচ্ছে।
     * Unique index duplicate cron আটকাবে।
     */
    let profitTransaction;

    try {
      const transactions =
        await Transaction.create(
          [
            {
              userId: user._id,
              investmentId: investment._id,
              type: "profit",
              amount: profitAmount,
              paymentMethod: "",
              trxId: "",
              profitDate,
              note: "Daily investment profit",
              status: "approved",
            },
          ],
          {
            session,
          },
        );

      profitTransaction = transactions[0];
    } catch (error) {
      if (error.code === 11000) {
        await session.abortTransaction();

        return {
          processed: false,
          reason:
            "Profit already processed today",
        };
      }

      throw error;
    }

    // ================= USER UPDATE =================

    user.balance =
      Number(user.balance || 0) +
      profitAmount;

    user.totalEarning =
      Number(user.totalEarning || 0) +
      profitAmount;

    await user.save({
      session,
    });

    // ================= INVESTMENT UPDATE =================

    investment.totalEarned =
      Number(investment.totalEarned || 0) +
      profitAmount;

    investment.remainingDays = Math.max(
      Number(investment.remainingDays || 0) -
        1,
      0,
    );

    investment.lastProfitDate = new Date();

    if (investment.remainingDays === 0) {
      investment.status = "completed";
      investment.completedAt = new Date();
    }

    await investment.save({
      session,
    });

    // ================= NOTIFICATION =================

    await notificationService.createNotification(
      user._id,
      "Daily Profit",
      `You received ৳${profitAmount} daily profit.`,
      "profit",
      session,
    );

    await session.commitTransaction();

    return {
      processed: true,
      investmentId: investment._id,
      profitAmount,
      transactionId: profitTransaction._id,
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

// ================= RUN DAILY PROFIT =================

exports.runDailyProfit = async () => {
  const { profitDate } = getDhakaDateParts();

  const investments = await Investment.find({
    status: "active",
    remainingDays: {
      $gt: 0,
    },
  }).select("_id");

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  const errors = [];

  for (const investment of investments) {
    try {
      const result =
        await processSingleInvestment(
          investment._id,
          profitDate,
        );

      if (result.processed) {
        processed += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      failed += 1;

      errors.push({
        investmentId:
          investment._id.toString(),
        message: error.message,
      });

      console.error(
        `Daily profit failed for investment ${investment._id}:`,
        error.message,
      );
    }
  }

  return {
    success: true,
    date: profitDate,
    total: investments.length,
    processed,
    skipped,
    failed,
    errors,
  };
};