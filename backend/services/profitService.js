const mongoose = require("mongoose");

const User = require("../models/User");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");

exports.runDailyProfit = async () => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const investments = await Investment.find({

            status: "active"

        }).session(session);

        let processed = 0;

        for (const investment of investments) {

            // একই দিনে দ্বিতীয়বার Profit দিবে না
            if (
                investment.lastProfitDate &&
                new Date(investment.lastProfitDate).toDateString() ===
                today.toDateString()
            ) {
                continue;
            }

            const user = await User.findById(
                investment.userId
            ).session(session);

            if (!user)
                continue;

            // User Update
            user.balance += investment.dailyReturn;

            user.totalEarning += investment.dailyReturn;

            await user.save({ session });

            // Investment Update
            investment.totalEarned += investment.dailyReturn;

            investment.remainingDays -= 1;

            investment.lastProfitDate = new Date();

            if (investment.remainingDays <= 0) {

                investment.status = "completed";

            }

            await investment.save({ session });

            // Profit Transaction Save
            await Transaction.create([{

                userId: user._id,

                type: "profit",

                amount: investment.dailyReturn,

                paymentMethod: "",

                trxId: "",

                note: "Daily investment profit",

                status: "approved"

            }], { session });

            processed++;

        }

        await session.commitTransaction();

        session.endSession();

        return {

            success: true,

            processed

        };

    } catch (err) {

        await session.abortTransaction();

        session.endSession();

        throw err;

    }

};