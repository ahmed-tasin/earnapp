const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const normalizePhone = require("../utils/normalizePhone");

// ================= GENERATE REFERRAL CODE =================

const generateReferralCode = async () => {
    let referralCode;
    let exists;

    do {
        referralCode = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        exists = await User.exists({ referralCode });
    } while (exists);

    return referralCode;
};

// ================= REGISTER =================

exports.register = async (data) => {

    const {
        name,
        password,
        referralCode
    } = data;

    const phone = normalizePhone(data.phone);
    const existingUser = await User.findOne({
        phone: { $in: normalizePhone.variants(phone) }
    });

    if (existingUser) {
        const error = new Error("Phone number already registered");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let referredBy = null;

    if (referralCode) {

        const referrer = await User.findOne({
            referralCode: referralCode.trim().toUpperCase()
        });

        if (!referrer) {
            const error = new Error("Invalid referral code");
            error.statusCode = 400;
            throw error;
        }

        referredBy = referrer._id;
    }

    // Keep these internal values for compatibility with existing database indexes.
    const username = phone;
    const email = `${phone}@users.earnapp.local`;

    const newUser = await User.create({

        name: name.trim(),

        username,

        email,

        password: hashedPassword,

        phone,

        referralCode: await generateReferralCode(),

        referredBy,

        balance: 200

    });

    if (referredBy) {

        await User.findByIdAndUpdate(referredBy, {

            $push: {
                directReferrals: newUser._id
            }

        });

    }

    const token = jwt.sign(

        {
            id: newUser._id,
            role: newUser.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }

    );

    const userResponse = newUser.toObject();

    delete userResponse.password;

    return {

        token,

        user: userResponse

    };

};

// ================= LOGIN =================

exports.login = async (data) => {

    const {
        password
    } = data;

    const phone = normalizePhone(data.phone);

    const user = await User.findOne({
        phone: { $in: normalizePhone.variants(phone) }
    }).select("+password");

    if (!user) {
        const error = new Error("Invalid phone number or password");
        error.statusCode = 401;
        throw error;
    }

    const match = await bcrypt.compare(
        password,
        user.password
    );

    if (!match) {
        const error = new Error("Invalid phone number or password");
        error.statusCode = 401;
        throw error;
    }

    if (user.status !== "active") {
        const error = new Error(
            "Your account has been suspended. Please contact support."
        );
        error.statusCode = 403;
        throw error;
    }

    user.lastLogin = new Date();

    await user.save();

    const token = jwt.sign(

        {
            id: user._id,
            role: user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }

    );

    const userResponse = user.toObject();

    delete userResponse.password;

    return {

        token,

        user: userResponse

    };

};