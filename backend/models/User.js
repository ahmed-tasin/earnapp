const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    phone: String,

    referralCode: {
        type: String,
        unique: true
    },

    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    directReferrals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    balance: {
        type: Number,
        default: 0
    },

    totalDeposit: {
        type: Number,
        default: 0
    },

    totalWithdraw: {
        type: Number,
        default: 0
    },

    totalEarning: {
        type: Number,
        default: 0
    },

    referralCommissionEarned: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["active","suspended"],
        default: "active"
    },

    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },

    kycVerified:{
        type:Boolean,
        default:false
    },

    lastLogin:Date

},
{
    timestamps:true
});

module.exports = mongoose.model("User",userSchema);