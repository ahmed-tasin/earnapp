const Transaction = require("../models/Transaction");
const User = require("../models/User");

// ================= DEPOSIT =================

exports.deposit = async (req, res) => {
    try {

        const { amount, method } = req.body;

        if (!amount || amount < 100) {
            return res.status(400).json({
                success: false,
                message: "Minimum deposit is ৳100"
            });
        }

        const transaction = await Transaction.create({
            userId: req.user.id,
            type: "deposit",
            amount,
            method,
            status: "pending",
            transactionId: `DEP${Date.now()}`
        });

        res.status(201).json({
            success: true,
            message: "Deposit request created",
            transaction
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// ================= CONFIRM DEPOSIT =================

exports.confirmDeposit = async (req, res) => {

    try {

        const { transactionId } = req.body;

        const transaction = await Transaction.findOne({
            transactionId
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        if (transaction.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Transaction already completed"
            });
        }

        transaction.status = "completed";

        await transaction.save();

        const user = await User.findById(transaction.userId);

        user.balance += transaction.amount;
        user.totalDeposit += transaction.amount;

        await user.save();

        res.json({
            success: true,
            message: "Deposit confirmed",
            balance: user.balance
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// ================= WITHDRAW =================

exports.withdraw = async (req, res) => {

    try {

        const { amount, method } = req.body;

        const user = await User.findById(req.user.id);

        if (!amount || amount < 200) {
            return res.status(400).json({
                success: false,
                message: "Minimum withdraw is ৳200"
            });
        }

        if (user.balance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance"
            });
        }

        user.balance -= amount;
        user.totalWithdraw += amount;

        await user.save();

        const transaction = await Transaction.create({

            userId: user._id,

            type: "withdraw",

            amount,

            method,

            status: "pending",

            transactionId: `WD${Date.now()}`

        });

        res.json({

            success: true,

            message: "Withdraw request submitted",

            transaction,

            balance: user.balance

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};