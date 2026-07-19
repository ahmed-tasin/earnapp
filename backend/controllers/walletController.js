const asyncHandler = require("../utils/asyncHandler");
const walletService = require("../services/walletService");

// ================= DEPOSIT REQUEST =================

exports.deposit = asyncHandler(async (req, res) => {

    const transaction = await walletService.deposit(
        req.user.id,
        req.body
    );

    res.status(201).json({
        success: true,
        message: "Deposit request submitted",
        transaction
    });

});

// ================= APPROVE DEPOSIT =================

exports.approveDeposit = asyncHandler(async (req, res) => {

    const transaction = await walletService.approveDeposit(
        req.params.id
    );

    res.json({
        success: true,
        message: "Deposit approved successfully",
        transaction
    });

});

// ================= WITHDRAW REQUEST =================

exports.withdraw = asyncHandler(async (req, res) => {

    const transaction = await walletService.withdraw(
        req.user.id,
        req.body
    );

    res.status(201).json({
        success: true,
        message: "Withdraw request submitted",
        transaction
    });

});

// ================= APPROVE WITHDRAW =================

exports.approveWithdraw = asyncHandler(async (req, res) => {

    const transaction = await walletService.approveWithdraw(
        req.params.id
    );

    res.json({
        success: true,
        message: "Withdraw approved successfully",
        transaction
    });

});

// ================= REJECT WITHDRAW =================

exports.rejectWithdraw = asyncHandler(async (req, res) => {

    const transaction = await walletService.rejectWithdraw(
        req.params.id
    );

    res.json({
        success: true,
        message: "Withdraw rejected successfully",
        transaction
    });

});


// ================= USER HISTORY =================

exports.getTransactionHistory = asyncHandler(async (req, res) => {

    const result = await walletService.getTransactionHistory(

        req.user.id,

        req.query.page,

        req.query.limit,

        req.query.type,

        req.query.status

    );

    res.json({

        success: true,

        ...result

    });

});

// ================= ADMIN HISTORY =================

exports.getAllTransactions = asyncHandler(async (req, res) => {

    const result = await walletService.getAllTransactions(

        req.query.page,

        req.query.limit,

        req.query.type,

        req.query.status

    );

    res.json({

        success: true,

        ...result

    });

});

