const User = require("../models/User");
const ReferralCommission = require("../models/ReferralCommission");

exports.getReferralInfo = async (req, res) => {

    try {

        const user = await User.findById(req.user.id);

        const commissions = await ReferralCommission.find({
            fromUser: req.user.id
        })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({

            success: true,

            referralCode: user.referralCode,

            referralLink:
                `${process.env.FRONTEND_URL}/?ref=${user.referralCode}`,

            totalCommission:
                user.referralCommissionEarned,

            totalReferrals:
                user.directReferrals.length,

            commissions

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};