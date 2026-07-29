const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    // পুরোনো database index compatibility-এর জন্য রাখা হয়েছে
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // পুরোনো database index compatibility-এর জন্য রাখা হয়েছে
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      index: true,
    },

    referralCode: {
      type: String,
      unique: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    directReferrals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    balance: {
      type: Number,
      default: 0,
    },

    totalDeposit: {
      type: Number,
      default: 0,
    },

    totalWithdraw: {
      type: Number,
      default: 0,
    },

    totalEarning: {
      type: Number,
      default: 0,
    },

    referralCommissionEarned: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    kycVerified: {
      type: Boolean,
      default: false,
    },

    withdrawalAccount: {
  accountName: {
    type: String,
    trim: true,
    maxlength: 50,
    default: "",
  },

  phone: {
    type: String,
    trim: true,
    default: "",
  },

  paymentMethod: {
    type: String,
    enum: ["", "bkash", "nagad", "rocket"],
    default: "",
  },

  accountNumber: {
    type: String,
    trim: true,
    default: "",
  },
},

lastLogin: Date,



    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);