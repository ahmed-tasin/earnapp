const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    type: {
        type: String,
        enum: ["deposit", "withdraw", "profit"],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        default: ""
    },

    trxId: {
        type: String,
        default: ""
    },

    note: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: [
            "pending",
            "approved",
            "rejected",
            "completed"
        ],
        default: "pending"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    "Transaction",
    transactionSchema
);