const mongoose = require("mongoose");
const User = require("../models/User");
const notificationService = require("./notificationService");
const Package = require("../models/Package");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");
const ReferralCommission = require("../models/ReferralCommission");


exports.getAdminDashboard = async () => {

    const totalUsers = await User.countDocuments();

    const activeUsers = await User.countDocuments({
        status: "active"
    });

    const suspendedUsers = await User.countDocuments({
        status: "suspended"
    });

    const totalPackages = await Package.countDocuments();

    const activeInvestments = await Investment.countDocuments({
        status: "active"
    });

    const completedInvestments = await Investment.countDocuments({
        status: "completed"
    });

    const pendingDeposits = await Transaction.countDocuments({
        type: "deposit",
        status: "pending"
    });

    const approvedDeposits = await Transaction.countDocuments({
        type: "deposit",
        status: "approved"
    });

    const pendingWithdraws = await Transaction.countDocuments({
        type: "withdraw",
        status: "pending"
    });

    const approvedWithdraws = await Transaction.countDocuments({
        type: "withdraw",
        status: "approved"
    });

    const depositAmount = await Transaction.aggregate([
        {
            $match: {
                type: "deposit",
                status: "approved"
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount"
                }
            }
        }
    ]);

    const withdrawAmount = await Transaction.aggregate([
        {
            $match: {
                type: "withdraw",
                status: "approved"
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount"
                }
            }
        }
    ]);

    const profitAmount = await Transaction.aggregate([
        {
            $match: {
                type: "profit",
                status: "approved"
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount"
                }
            }
        }
    ]);

    return {

        totalUsers,

        activeUsers,

        suspendedUsers,

        totalPackages,

        activeInvestments,

        completedInvestments,

        pendingDeposits,

        approvedDeposits,

        pendingWithdraws,

        approvedWithdraws,

        totalDepositAmount:
            depositAmount.length
                ? depositAmount[0].total
                : 0,

        totalWithdrawAmount:
            withdrawAmount.length
                ? withdrawAmount[0].total
                : 0,

        totalProfitPaid:
            profitAmount.length
                ? profitAmount[0].total
                : 0

    };

};


exports.getUsers = async ({
    page = 1,
    limit = 20,
    phone,
    status,
    role,
    sort = "newest"
}) => {
    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter = {};

    if (phone) {
        filter.phone = {
            $regex: phone.trim(),
            $options: "i"
        };
    }

    if (status) {
        filter.status = status;
    }

    if (role) {
        filter.role = role;
    }

    const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        balance_high: { balance: -1 },
        balance_low: { balance: 1 }
    };

    const selectedSort =
        sortOptions[sort] || sortOptions.newest;

    const [total, users] = await Promise.all([
        User.countDocuments(filter),

        User.find(filter)
            .select("-password -__v")
            .sort(selectedSort)
            .skip((page - 1) * limit)
            .limit(limit)
    ]);

    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        users
    };
};


exports.getUserDetails = async (userId) => {

    const user = await User.findById(userId)
        .select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    const investments = await Investment.find({
        userId
    }).populate("packageId");

    const transactions = await Transaction.find({
        userId
    }).sort({ createdAt: -1 });

    const referralHistory = await ReferralCommission.find({
        fromUser: userId
    }).populate(
        "toUser",
        "username email phone"
    );

    return {
        user,
        investments,
        transactions,
        referralHistory
    };

};


exports.suspendUser = async (userId, adminId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const error = new Error("Invalid user ID");
        error.statusCode = 400;
        throw error;
    }

    if (userId.toString() === adminId.toString()) {
        const error = new Error("You cannot suspend your own account");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (user.status === "blocked") {
        const error = new Error("User is already suspended");
        error.statusCode = 400;
        throw error;
    }

    user.status = "blocked";
    await user.save();

    await notificationService.createNotification(
        user._id,
        "Account Suspended",
        "Your account has been suspended by the administrator.",
        "account"
    );

    return user;
};

exports.activateUser = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const error = new Error("Invalid user ID");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (user.status === "active") {
        const error = new Error("User is already active");
        error.statusCode = 400;
        throw error;
    }

    user.status = "active";
    await user.save();

    await notificationService.createNotification(
        user._id,
        "Account Activated",
        "Your account has been activated by the administrator.",
        "account"
    );

    return user;
};

exports.updateUser = async (userId, updateData, adminId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const error = new Error("Invalid user ID");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const allowedFields = [
        "username",
        "email",
        "phone",
        "role",
        "status",
        "kycVerified"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    });

    if (Object.keys(updates).length === 0) {
        const error = new Error("No valid fields provided for update");
        error.statusCode = 400;
        throw error;
    }

    // Normalize string values
    if (updates.username) {
        updates.username = updates.username.trim();
    }

    if (updates.email) {
        updates.email = updates.email.trim().toLowerCase();
    }

    if (updates.phone) {
        updates.phone = updates.phone.trim();
    }

    // Validate role
    if (
        updates.role &&
        !["user", "admin"].includes(updates.role)
    ) {
        const error = new Error(
            "Role must be either user or admin"
        );
        error.statusCode = 400;
        throw error;
    }

    // Validate status
    if (
        updates.status &&
        !["active", "blocked"].includes(updates.status)
    ) {
        const error = new Error(
            "Status must be either active or blocked"
        );
        error.statusCode = 400;
        throw error;
    }

    // Validate KYC value
    if (
        updates.kycVerified !== undefined &&
        typeof updates.kycVerified !== "boolean"
    ) {
        const error = new Error(
            "kycVerified must be true or false"
        );
        error.statusCode = 400;
        throw error;
    }

    // Admin cannot block own account
    if (
        userId.toString() === adminId.toString() &&
        updates.status === "blocked"
    ) {
        const error = new Error(
            "You cannot block your own account"
        );
        error.statusCode = 400;
        throw error;
    }

    // Admin cannot remove own admin role
    if (
        userId.toString() === adminId.toString() &&
        updates.role &&
        updates.role !== "admin"
    ) {
        const error = new Error(
            "You cannot remove your own admin role"
        );
        error.statusCode = 400;
        throw error;
    }

    // Check duplicate username
    if (
        updates.username &&
        updates.username !== user.username
    ) {
        const existingUsername = await User.findOne({
            username: updates.username,
            _id: { $ne: userId }
        });

        if (existingUsername) {
            const error = new Error(
                "Username is already in use"
            );
            error.statusCode = 409;
            throw error;
        }
    }

    // Check duplicate email
    if (
        updates.email &&
        updates.email !== user.email
    ) {
        const existingEmail = await User.findOne({
            email: updates.email,
            _id: { $ne: userId }
        });

        if (existingEmail) {
            const error = new Error(
                "Email is already in use"
            );
            error.statusCode = 409;
            throw error;
        }
    }

    // Check duplicate phone
    if (
        updates.phone &&
        updates.phone !== user.phone
    ) {
        const existingPhone = await User.findOne({
            phone: updates.phone,
            _id: { $ne: userId }
        });

        if (existingPhone) {
            const error = new Error(
                "Phone number is already in use"
            );
            error.statusCode = 409;
            throw error;
        }
    }

    const previousStatus = user.status;
    const previousKycStatus = user.kycVerified;

    Object.assign(user, updates);

    await user.save();

    // Status notification
    if (
        updates.status &&
        updates.status !== previousStatus
    ) {
        const title =
            updates.status === "active"
                ? "Account Activated"
                : "Account Suspended";

        const message =
            updates.status === "active"
                ? "Your account has been activated by the administrator."
                : "Your account has been suspended by the administrator.";

        await notificationService.createNotification(
            user._id,
            title,
            message,
            "system"
        );
    }

    // KYC notification
    if (
        updates.kycVerified !== undefined &&
        updates.kycVerified !== previousKycStatus
    ) {
        const title = updates.kycVerified
            ? "KYC Verified"
            : "KYC Verification Removed";

        const message = updates.kycVerified
            ? "Your KYC verification has been approved."
            : "Your KYC verification status has been removed.";

        await notificationService.createNotification(
            user._id,
            title,
            message,
            "system"
        );
    }

    return User.findById(userId).select("-password -__v");
};
