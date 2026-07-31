const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },

    investmentAmount: Number,

    dailyReturn: Number,

    totalDays: Number,

    startDate: Date,

    endDate: Date,

    lastProfitDate: {
      type: Date,
      default: null,
    },

    nextClaimAt: {
      type: Date,
      default: null,
      index: true,
    },

    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingDays: {
      type: Number,
      required: true,
      min: 0,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

investmentSchema.index({
  userId: 1,
  status: 1,
  createdAt: -1,
});

investmentSchema.index({
  userId: 1,
  packageId: 1,
});

module.exports = mongoose.model("Investment", investmentSchema);