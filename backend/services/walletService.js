const User = require("../models/User");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// ================= DEPOSIT REQUEST =================

exports.deposit = async (userId, data) => {

    const transaction = await Transaction.create({

        userId,

        type: "deposit",

        amount: data.amount,

        paymentMethod: data.paymentMethod,

        trxId: data.trxId,

        note: data.note || "",

        status: "pending"

    });

    return transaction;

};

// ================= APPROVE DEPOSIT =================

exports.approveDeposit = async (transactionId) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const transaction = await Transaction.findById(transactionId)
            .session(session);

        if (!transaction)
            throw new Error("Transaction not found");

        if (transaction.type !== "deposit")
            throw new Error("Invalid transaction type");

        if (transaction.status !== "pending")
            throw new Error("Transaction already processed");

        const user = await User.findById(transaction.userId)
            .session(session);

        if (!user)
            throw new Error("User not found");

        user.balance += transaction.amount;
        user.totalDeposit += transaction.amount;

        await user.save({ session });

        transaction.status = "approved";

        await transaction.save({ session });

        await session.commitTransaction();

        session.endSession();

        return transaction;

    } catch (err) {

        await session.abortTransaction();

        session.endSession();

        throw err;

    }

};

// ================= WITHDRAW REQUEST =================

exports.withdraw = async (userId, data) => {

    const user = await User.findById(userId);

    if (!user)
        throw new Error("User not found");

    if (user.balance < data.amount)
        throw new Error("Insufficient balance");

    const transaction = await Transaction.create({

        userId,

        type: "withdraw",

        amount: data.amount,

        paymentMethod: data.paymentMethod,

        note: data.accountNumber || "",

        status: "pending"

    });

    return transaction;

};

// ================= APPROVE WITHDRAW =================

exports.approveWithdraw = async (transactionId) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const transaction = await Transaction.findById(transactionId)
            .session(session);

        if (!transaction)
            throw new Error("Transaction not found");

        if (transaction.type !== "withdraw")
            throw new Error("Invalid transaction type");

        if (transaction.status !== "pending")
            throw new Error("Transaction already processed");

        const user = await User.findById(transaction.userId)
            .session(session);

        if (!user)
            throw new Error("User not found");

        if (user.balance < transaction.amount)
            throw new Error("Insufficient balance");

        user.balance -= transaction.amount;
        user.totalWithdraw += transaction.amount;

        await user.save({ session });

        transaction.status = "approved";

        await transaction.save({ session });

        await session.commitTransaction();

        session.endSession();

        return transaction;

    } catch (err) {

        await session.abortTransaction();

        session.endSession();

        throw err;

    }

};

// ================= REJECT WITHDRAW =================

exports.rejectWithdraw = async (transactionId) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const transaction = await Transaction.findById(transactionId)
            .session(session);

    if (!transaction)
        throw new Error("Transaction not found");

    if (transaction.type !== "withdraw")
        throw new Error("Invalid transaction type");

    if (transaction.status !== "pending")
        throw new Error("Transaction already processed");

    transaction.status = "rejected";

    await transaction.save({ session });

    await session.commitTransaction();

    session.endSession();

    return transaction;

    } catch (err) {

    await session.abortTransaction();

    session.endSession();

    throw err;

}

};


// ================= USER TRANSACTION HISTORY =================

exports.getTransactionHistory = async (
    userId,
    page = 1,
    limit = 10,
    type,
    status
) => {

    const query = { userId };

    if (type)
        query.type = type;

    if (status)
        query.status = status;

    const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    return {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        transactions
    };

};

// ================= ADMIN TRANSACTION HISTORY =================

exports.getAllTransactions = async (
    page = 1,
    limit = 20,
    type,
    status
) => {

    const query = {};

    if (type)
        query.type = type;

    if (status)
        query.status = status;

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
        transactions
    };

};