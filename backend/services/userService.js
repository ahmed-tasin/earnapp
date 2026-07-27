const User = require("../models/User");
const bcrypt = require("bcryptjs");
const normalizePhone = require("../utils/normalizePhone");

// ================= GET PROFILE =================

exports.getProfile = async (userId) => {

    const user = await User.findById(userId)
        .select("-password -__v");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

// ================= UPDATE PROFILE =================

exports.updateProfile = async (userId, data) => {

    const { name } = data;
    const phone = data.phone ? normalizePhone(data.phone) : "";

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (name) {
        const normalizedName = name.trim();

        if (normalizedName.length < 2 || normalizedName.length > 50) {
            throw new Error("Name must be 2-50 characters");
        }

        user.name = normalizedName;
    }

    if (phone) {
        if (!/^01[3-9]\d{8}$/.test(phone)) {
            throw new Error("Enter a valid Bangladesh phone number");
        }

        const existingUser = await User.findOne({
            _id: { $ne: userId },
            phone: { $in: normalizePhone.variants(phone) }
        });

        if (existingUser) {
            throw new Error("Phone number already registered");
        }

        user.phone = phone;
    }

    await user.save();

    return await User.findById(userId).select("-password -__v");
};

// ================= CHANGE PASSWORD =================

exports.changePassword = async (userId, data) => {

    const { oldPassword, newPassword } = data;

    const user = await User.findById(userId)
        .select("+password");

    if (!user) {
        throw new Error("User not found");
    }

    const match = await bcrypt.compare(
        oldPassword,
        user.password
    );

    if (!match) {
        throw new Error("Old password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return true;
};

// ================= DASHBOARD =================

exports.getDashboard = async (userId) => {

    const user = await User.findById(userId)
        .select(
            "balance totalDeposit totalWithdraw totalEarning referralCommissionEarned"
        );

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};