const User = require("../models/User");
const bcrypt = require("bcryptjs");

const normalizePhone = require(
  "../utils/normalizePhone"
);

// ================= GET PROFILE =================

exports.getProfile = async (userId) => {
  const user = await User.findById(
    userId
  ).select("-password -__v");

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return user;
};

// ================= UPDATE PROFILE =================

exports.updateProfile = async (
  userId,
  data
) => {
  const name = String(
    data.name || ""
  ).trim();

  const phone = data.phone
    ? normalizePhone(data.phone)
    : "";

  const user = await User.findById(
    userId
  );

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;
    throw error;
  }

  if (name) {
    if (
      name.length < 2 ||
      name.length > 50
    ) {
      const error = new Error(
        "Name must be 2-50 characters"
      );

      error.statusCode = 400;
      throw error;
    }

    user.name = name;
  }

  if (phone) {
    if (
      !/^01[3-9]\d{8}$/.test(phone)
    ) {
      const error = new Error(
        "Enter a valid Bangladesh phone number"
      );

      error.statusCode = 400;
      throw error;
    }

    const existingUser =
      await User.findOne({
        _id: {
          $ne: userId,
        },

        phone: {
          $in: normalizePhone.variants(
            phone
          ),
        },
      });

    if (existingUser) {
      const error = new Error(
        "Phone number already registered"
      );

      error.statusCode = 409;
      throw error;
    }

    user.phone = phone;
  }

  await user.save();

  return User.findById(
    userId
  ).select("-password -__v");
};

// ================= UPDATE WITHDRAWAL ACCOUNT =================

exports.updateWithdrawalAccount =
  async (userId, data) => {
    const accountName = String(
      data.accountName || ""
    ).trim();

    const paymentMethod = String(
      data.paymentMethod || ""
    )
      .trim()
      .toLowerCase();

    const accountNumber =
      normalizePhone(
        data.accountNumber
      );

    if (
      accountName.length < 2 ||
      accountName.length > 50
    ) {
      const error = new Error(
        "Name must be 2-50 characters"
      );

      error.statusCode = 400;
      throw error;
    }

    const allowedMethods = [
      "bkash",
      "nagad",
      "rocket",
    ];

    if (
      !allowedMethods.includes(
        paymentMethod
      )
    ) {
      const error = new Error(
        "Select bKash, Nagad or Rocket"
      );

      error.statusCode = 400;
      throw error;
    }

    if (
      !/^01\d{9}$/.test(
        accountNumber
      )
    ) {
      const error = new Error(
        "Enter a valid payment account number"
      );

      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(
      userId
    );

    if (!user) {
      const error = new Error(
        "User not found"
      );

      error.statusCode = 404;
      throw error;
    }

    user.withdrawalAccount = {
      accountName,

      // আলাদা phone input লাগবে না
      // Registered phone নেওয়া হবে
      phone: normalizePhone(
        user.phone
      ),

      paymentMethod,
      accountNumber,
    };

    await user.save();

    return user.withdrawalAccount;
  };

// ================= CHANGE PASSWORD =================

exports.changePassword = async (
  userId,
  data
) => {
  const currentPassword =
    data.currentPassword ||
    data.oldPassword ||
    "";

  const newPassword = String(
    data.newPassword || ""
  );

  if (!currentPassword) {
    const error = new Error(
      "Current password is required"
    );

    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error(
      "New password must be at least 6 characters"
    );

    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(
    userId
  ).select("+password");

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;
    throw error;
  }

  const passwordMatches =
    await bcrypt.compare(
      currentPassword,
      user.password
    );

  if (!passwordMatches) {
    const error = new Error(
      "Current password is incorrect"
    );

    error.statusCode = 401;
    throw error;
  }

  user.password = await bcrypt.hash(
    newPassword,
    10
  );

  await user.save();

  return true;
};

// ================= DASHBOARD =================

exports.getDashboard = async (
  userId
) => {
  const user = await User.findById(
    userId
  ).select(
    [
      "balance",
      "totalDeposit",
      "totalWithdraw",
      "totalEarning",
      "referralCommissionEarned",
    ].join(" ")
  );

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return user;
};