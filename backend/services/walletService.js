const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const notificationService = require("./notificationService");
const Investment = require("../models/Investment");

// ================= DEPOSIT REQUEST =================

exports.deposit = async (userId, data) => {
  const amount = Number(data.amount);

  const paymentMethod = String(
    data.paymentMethod || "",
  )
    .trim()
    .toLowerCase();

  const trxId = String(data.trxId || "")
    .trim()
    .toUpperCase();

  const note = String(data.note || "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error(
      "Deposit amount must be greater than zero",
    );

    error.statusCode = 400;
    throw error;
  }

  if (!paymentMethod) {
    const error = new Error(
      "Payment method is required",
    );

    error.statusCode = 400;
    throw error;
  }

  if (!trxId) {
    const error = new Error(
      "Transaction ID is required",
    );

    error.statusCode = 400;
    throw error;
  }

  const existingTransaction =
    await Transaction.findOne({
      type: "deposit",
      trxId,
    }).select("_id status createdAt");

  if (existingTransaction) {
    const error = new Error(
      "This transaction ID has already been submitted",
    );

    error.statusCode = 409;
    throw error;
  }

  try {
    const transaction =
      await Transaction.create({
        userId,
        type: "deposit",
        amount,
        paymentMethod,
        trxId,
        note,
        status: "pending",
      });

    return transaction;
  } catch (error) {
    // Database unique index duplicate error
    if (error.code === 11000) {
      const duplicateError = new Error(
        "This transaction ID has already been submitted",
      );

      duplicateError.statusCode = 409;

      throw duplicateError;
    }

    throw error;
  }
};

// ================= APPROVE DEPOSIT =================

exports.approveDeposit = async (
  transactionId,
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const transaction =
      await Transaction.findOne({
        _id: transactionId,
        type: "deposit",
        status: "pending",
      }).session(session);

    if (!transaction) {
      const existingTransaction =
        await Transaction.findById(
          transactionId,
        ).session(session);

      if (!existingTransaction) {
        const error = new Error(
          "Transaction not found",
        );

        error.statusCode = 404;
        throw error;
      }

      if (
        existingTransaction.type !==
        "deposit"
      ) {
        const error = new Error(
          "Invalid transaction type",
        );

        error.statusCode = 400;
        throw error;
      }

      const error = new Error(
        "Transaction already processed",
      );

      error.statusCode = 409;
      throw error;
    }

    const user = await User.findById(
      transaction.userId,
    ).session(session);

    if (!user) {
      const error = new Error(
        "User not found",
      );

      error.statusCode = 404;
      throw error;
    }

    const depositAmount = Number(
      transaction.amount,
    );

    user.balance =
      Number(user.balance || 0) +
      depositAmount;

    user.totalDeposit =
      Number(user.totalDeposit || 0) +
      depositAmount;

    await user.save({ session });

    transaction.status = "approved";

    await transaction.save({
      session,
    });

    await notificationService.createNotification(
      user._id,
      "Deposit Approved",
      `Your deposit of ৳${depositAmount} has been approved.`,
      "deposit",
      session,
    );

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

// ================= WITHDRAW REQUEST =================

exports.withdraw = async (userId, data) => {
  const amount = Number(data.amount);
  const password = String(data.password || "");

  const minimumWithdraw = Number(
    process.env.MIN_WITHDRAW_AMOUNT || 100,
  );

  // ================= VALIDATION =================

  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error(
      "Withdraw amount must be greater than zero",
    );

    error.statusCode = 400;
    throw error;
  }

  if (amount < minimumWithdraw) {
    const error = new Error(
      `Minimum withdraw amount is ৳${minimumWithdraw}`,
    );

    error.statusCode = 400;
    throw error;
  }

  if (!password) {
    const error = new Error("Password is required");

    error.statusCode = 400;
    throw error;
  }

  // ================= USER CHECK =================

  const user = await User.findById(userId)
    .select("+password");

  if (!user) {
    const error = new Error("User not found");

    error.statusCode = 404;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password,
  );

  if (!passwordMatches) {
    const error = new Error("Incorrect password");

    error.statusCode = 401;
    throw error;
  }

  const withdrawalAccount =
    user.withdrawalAccount || {};

  const paymentMethod = String(
    withdrawalAccount.paymentMethod || "",
  )
    .trim()
    .toLowerCase();

  const accountNumber = String(
    withdrawalAccount.accountNumber || "",
  ).trim();

  const allowedPaymentMethods = [
    "bkash",
    "nagad",
    "rocket",
  ];

  if (
    !allowedPaymentMethods.includes(paymentMethod) ||
    !/^01\d{9}$/.test(accountNumber)
  ) {
    const error = new Error(
      "Set a valid withdrawal card before withdrawing",
    );

    error.statusCode = 400;
    throw error;
  }

  if (user.status === "suspended") {
    const error = new Error(
      "Your account is suspended",
    );

    error.statusCode = 403;
    throw error;
  }

  /*
   * User balance থেকে pending withdraw বাদ দিয়ে
   * available balance নির্ধারণ করা হচ্ছে।
   */
  const pendingWithdrawResult =
    await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(
            userId,
          ),
          type: "withdraw",
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          totalPendingAmount: {
            $sum: "$amount",
          },
        },
      },
    ]);

  const pendingWithdrawAmount =
    pendingWithdrawResult[0]
      ?.totalPendingAmount || 0;

  const currentBalance = Number(
    user.balance || 0,
  );

  const availableBalance =
    currentBalance -
    Number(pendingWithdrawAmount);

  if (amount > availableBalance) {
    const error = new Error(
      `Insufficient available balance. Available balance: ৳${availableBalance}`,
    );

    error.statusCode = 400;
    throw error;
  }

  // ================= CREATE REQUEST =================

  const transaction =
    await Transaction.create({
      userId,

      type: "withdraw",

      amount,

      paymentMethod,

      accountNumber,

      accountName:
        withdrawalAccount.accountName || user.name || user.username,

      contactPhone:
        withdrawalAccount.phone || user.phone,

      // পুরোনো admin/history response-এর compatibility-এর জন্য
      note: accountNumber,

      trxId: "",

      status: "pending",
    });

  return {
    transaction,

    wallet: {
      balance: currentBalance,
      pendingWithdraw:
        pendingWithdrawAmount + amount,
      availableBalance:
        availableBalance - amount,
    },
  };
};

// ================= APPROVE WITHDRAW =================

exports.approveWithdraw = async (
  transactionId,
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const transaction =
      await Transaction.findOne({
        _id: transactionId,
        type: "withdraw",
        status: "pending",
      }).session(session);

    if (!transaction) {
      const existingTransaction =
        await Transaction.findById(
          transactionId,
        ).session(session);

      if (!existingTransaction) {
        const error = new Error(
          "Transaction not found",
        );

        error.statusCode = 404;
        throw error;
      }

      if (
        existingTransaction.type !==
        "withdraw"
      ) {
        const error = new Error(
          "Invalid transaction type",
        );

        error.statusCode = 400;
        throw error;
      }

      const error = new Error(
        "Transaction already processed",
      );

      error.statusCode = 409;
      throw error;
    }

    const user = await User.findById(
      transaction.userId,
    ).session(session);

    if (!user) {
      const error = new Error(
        "User not found",
      );

      error.statusCode = 404;
      throw error;
    }

    const withdrawAmount = Number(
      transaction.amount,
    );

    const currentBalance = Number(
      user.balance || 0,
    );

    /*
     * Request তৈরি হওয়ার পর balance অন্য জায়গায়
     * কমে যেতে পারে, তাই approval-এর সময় আবার check।
     */
    if (currentBalance < withdrawAmount) {
      const error = new Error(
        "Insufficient balance to approve this withdrawal",
      );

      error.statusCode = 400;
      throw error;
    }

    // ================= USER UPDATE =================

    user.balance =
      currentBalance - withdrawAmount;

    user.totalWithdraw =
      Number(user.totalWithdraw || 0) +
      withdrawAmount;

    await user.save({
      session,
    });

    // ================= TRANSACTION UPDATE =================

    transaction.status = "approved";

    await transaction.save({
      session,
    });

    // ================= NOTIFICATION =================

    await notificationService.createNotification(
      user._id,
      "Withdraw Approved",
      `Your withdraw request of ৳${withdrawAmount} has been approved.`,
      "withdraw",
      session,
    );

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

// ================= REJECT DEPOSIT =================

exports.rejectDeposit = async (
  transactionId,
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const transaction =
      await Transaction.findOne({
        _id: transactionId,
        type: "deposit",
        status: "pending",
      }).session(session);

    if (!transaction) {
      const existingTransaction =
        await Transaction.findById(
          transactionId,
        ).session(session);

      if (!existingTransaction) {
        const error = new Error(
          "Transaction not found",
        );

        error.statusCode = 404;
        throw error;
      }

      if (
        existingTransaction.type !==
        "deposit"
      ) {
        const error = new Error(
          "Invalid transaction type",
        );

        error.statusCode = 400;
        throw error;
      }

      const error = new Error(
        "Transaction already processed",
      );

      error.statusCode = 409;
      throw error;
    }

    transaction.status = "rejected";

    await transaction.save({
      session,
    });

    await notificationService.createNotification(
      transaction.userId,
      "Deposit Rejected",
      `Your deposit request of ৳${transaction.amount} has been rejected.`,
      "deposit",
      session,
    );

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

// ================= REJECT WITHDRAW =================

exports.rejectWithdraw = async (
  transactionId,
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const transaction =
      await Transaction.findOne({
        _id: transactionId,
        type: "withdraw",
        status: "pending",
      }).session(session);

    if (!transaction) {
      const existingTransaction =
        await Transaction.findById(
          transactionId,
        ).session(session);

      if (!existingTransaction) {
        const error = new Error(
          "Transaction not found",
        );

        error.statusCode = 404;
        throw error;
      }

      if (
        existingTransaction.type !==
        "withdraw"
      ) {
        const error = new Error(
          "Invalid transaction type",
        );

        error.statusCode = 400;
        throw error;
      }

      const error = new Error(
        "Transaction already processed",
      );

      error.statusCode = 409;
      throw error;
    }

    transaction.status = "rejected";

    await transaction.save({
      session,
    });

    await notificationService.createNotification(
      transaction.userId,
      "Withdraw Rejected",
      `Your withdraw request of ৳${transaction.amount} has been rejected.`,
      "withdraw",
      session,
    );

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};
// ================= USER TRANSACTION HISTORY =================

exports.getTransactionHistory = async (
  userId,
  page = 1,
  limit = 10,
  type,
  status,
) => {
  const query = { userId };

  if (type) query.type = type;

  if (status) query.status = status;

  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Transaction.countDocuments(query);

  return {
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    transactions,
  };
};

// ================= ADMIN TRANSACTION HISTORY =================

exports.getAllTransactions = async (page = 1, limit = 20, type, status) => {
  const query = {};

  if (type) query.type = type;

  if (status) query.status = status;

  const transactions = await Transaction.find(query)
    .populate("userId", "username email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Transaction.countDocuments(query);

  return {
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    transactions,
  };
};

// ================= ADMIN GET DEPOSITS =================

exports.getAdminDeposits = async () => {
  const deposits = await Transaction.find({
    type: "deposit",
  })
    .populate(
      "userId",
      "username email phone balance",
    )
    .sort({ createdAt: -1 });

  return deposits;
};

// ================= ADMIN GET WITHDRAWS =================

exports.getAdminWithdraws = async () => {
  const withdraws = await Transaction.find({
    type: "withdraw",
  })
    .populate(
      "userId",
      "username email phone withdrawalAccount balance totalWithdraw",
    )
    .sort({ createdAt: -1 });

  return withdraws;
};

exports.getDashboardStats = async () => {
  const [totalUsers, pendingDeposits, pendingWithdraws, activeInvestments] =
    await Promise.all([
      User.countDocuments({}),
      Transaction.countDocuments({
        type: "deposit",
        status: "pending",
      }),
      Transaction.countDocuments({
        type: "withdraw",
        status: "pending",
      }),
      Investment.countDocuments({
        status: "active",
      }),
    ]);

  return {
    totalUsers,
    pendingDeposits,
    pendingWithdraws,
    activeInvestments,
  };
};


exports.getWallet = async (userId) => {
  const wallet = await User.findById(userId).select(
    "balance totalDeposit totalWithdraw totalEarning referralCommissionEarned"
  );

  if (!wallet) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return wallet;
};