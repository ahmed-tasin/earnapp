const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["deposit", "withdraw", "profit", "referral", "investment"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    feeAmount: {
  type: Number,
  default: 0,
  min: 0,
},

netAmount: {
  type: Number,
  default: 0,
  min: 0,
},

    paymentMethod: {
      type: String,
      trim: true,
      default: "",
    },

    accountNumber: {
      type: String,
      trim: true,
      default: "",
    },

    accountName: {
      type: String,
      trim: true,
      default: "",
    },

    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },

    trxId: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investment",
      default: null,
    },

    profitDate: {
      type: String,
      trim: true,
      default: "",
    },

    claimSequence: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index(
  {
    trxId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "deposit",
      trxId: {
        $type: "string",
        $ne: "",
      },
    },
  },
);

transactionSchema.index(
  {
    investmentId: 1,
    claimSequence: 1,
    type: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "profit",
      investmentId: {
        $type: "objectId",
      },
      claimSequence: {
        $type: "number",
      },
    },
  },
);


transactionSchema.index(
  {
    investmentId: 1,
    profitDate: 1,
    type: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "profit",
      investmentId: {
        $type: "objectId",
      },
      profitDate: {
        $type: "string",
        $ne: "",
      },
    },
  },
);

module.exports = mongoose.model("Transaction", transactionSchema);