const Checkin = require("../models/Checkin");
const User = require("../models/User");

exports.dailyCheckin = async (req, res) => {
    try {

        const userId = req.user.id;

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);

        tomorrow.setDate(tomorrow.getDate() + 1);

        const existing = await Checkin.findOne({
            userId,
            checkinDate: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Already checked in today"
            });
        }

        const last = await Checkin.findOne({
            userId
        }).sort({ createdAt: -1 });

        let streak = 1;

        if (last) {

            const yesterday = new Date();

            yesterday.setDate(yesterday.getDate() - 1);

            yesterday.setHours(0, 0, 0, 0);

            const lastDate = new Date(last.checkinDate);

            lastDate.setHours(0, 0, 0, 0);

            if (lastDate.getTime() === yesterday.getTime()) {
                streak = last.streak + 1;
            }

        }

        const reward = streak >= 7 ? 15 : 10;

        await Checkin.create({
            userId,
            checkinDate: new Date(),
            rewardAmount: reward,
            streak
        });

        const user = await User.findById(userId);

        user.balance += reward;
        user.totalEarning += reward;

        await user.save();

        res.json({
            success: true,
            reward,
            streak,
            balance: user.balance
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};