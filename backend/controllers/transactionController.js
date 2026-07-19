const Transaction = require("../models/Transaction");

exports.getTransactions = async (req, res) => {

    try {

        const transactions = await Transaction.find({
            userId: req.user.id
        })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({

            success: true,

            transactions

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};