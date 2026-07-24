const User = require("../models/User");
const ReferralCommission = require("../models/ReferralCommission");
const referralService = require("../services/referralService");
const asyncHandler = require("../utils/asyncHandler");


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




// ================= REFERRAL HISTORY =================

exports.getReferralHistory = asyncHandler(async (req, res) => {

    const result =
        await referralService.getReferralHistory(
            req.user.id
        );

    res.json({

        success: true,

        ...result

    });

});


// ================= REFERRAL SUMMARY =================

exports.getReferralSummary = asyncHandler(async (req, res) => {

    const summary = await referralService.getReferralSummary(
        req.user.id
    );

    res.json({

        success: true,

        summary

    });

});
