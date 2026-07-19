const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

    const { username, phone } = data;

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (username) user.username = username;
    if (phone) user.phone = phone;

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
