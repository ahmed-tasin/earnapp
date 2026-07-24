const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= GENERATE REFERRAL CODE =================

const generateReferralCode = () => {

    return `REF${Date.now()}${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;

};

// ================= REGISTER =================

exports.register = async (data) => {

    const {
        username,
        email,
        password,
        phone,
        referralCode
    } = data;

    const existingUser = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    });

    if (existingUser) {

        throw new Error(
            existingUser.email === email
                ? "Email already exists"
                : "Username already exists"
        );

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let referredBy = null;

    if (referralCode) {

        const referrer = await User.findOne({
            referralCode
        });

        if (referrer) {
            referredBy = referrer._id;
        }

    }

    const newUser = await User.create({

        username,

        email,

        password: hashedPassword,

        phone,

        referralCode: generateReferralCode(),

        referredBy,

        balance: 1000

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
        email,
        password
    } = data;

    const user = await User.findOne({
        email
    }).select("+password");

    if (!user) {
        throw new Error("User not found");
    }

    const match = await bcrypt.compare(
        password,
        user.password
    );

    if (user.status === "blocked") {
    const error = new Error(
        "Your account has been suspended. Please contact support."
    );
    error.statusCode = 403;
    throw error;
    }

    if (!match) {
        throw new Error("Invalid password");
    }

    if (user.status !== "active") {
        throw new Error("Account suspended");
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