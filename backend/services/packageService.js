const Package = require("../models/Package");
const Investment = require("../models/Investment");
const User = require("../models/User");
const ReferralCommission = require("../models/ReferralCommission");
const referralService = require("./referralService");
const mongoose = require("mongoose");
const notificationService = require("./notificationService");

// ================= GET PACKAGES =================

exports.getPackages = async () => {

    return await Package.find({
        status: "active"
    });

};

// ================= CREATE PACKAGE =================

exports.createPackage = async (data) => {

    return await Package.create({

        name: data.name,

        amount: data.amount,

        dailyReturn: data.dailyReturn,

        totalDays: data.totalDays,

        status: "active"

    });

};

// ================= BUY PACKAGE =================

exports.buyPackage = async (userId, packageId) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const user = await User.findById(userId).session(session);

        if (!user)
            throw new Error("User not found");

        const pkg = await Package.findById(packageId).session(session);

        if (!pkg || pkg.status !== "active")
            throw new Error("Package not found");

        if (user.balance < pkg.amount)
            throw new Error("Insufficient balance");

        user.balance -= pkg.amount;

        await user.save({ session });

        const investment = await Investment.create([{

            userId: user._id,

            packageId: pkg._id,

            investmentAmount: pkg.amount,

            dailyReturn: pkg.dailyReturn,

            totalDays: pkg.totalDays,

            remainingDays: pkg.totalDays,

            startDate: new Date(),

            endDate: new Date(
                Date.now() +
                pkg.totalDays * 24 * 60 * 60 * 1000
            ),

            totalEarned: 0,

            status: "active"

        }], { session });

      await referralService.payReferralCommission(
    user._id,
    pkg.amount,
    session
);

// Create a notification for the user

        await notificationService.createNotification(
           user._id,
            "Package Purchased",
            `You successfully purchased the ${pkg.name} package for ৳${pkg.amount}.`,
            "package"
         );


        await session.commitTransaction();

        session.endSession();

        return {

            investment: investment[0],

            balance: user.balance

        };

    } catch (err) {

        await session.abortTransaction();

        session.endSession();

        throw err;

    }

};

