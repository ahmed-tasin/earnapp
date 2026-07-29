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



// ================= UPDATE WITHDRAWAL ACCOUNT =================

exports.updateWithdrawalAccount = async (userId, data) => {
  const accountName = String(data.accountName || "").trim();

  const phone = normalizePhone(data.phone);

  const paymentMethod = String(
    data.paymentMethod || ""
  )
    .trim()
    .toLowerCase();

  const accountNumber = normalizePhone(
    data.accountNumber
  );

  if (accountName.length < 2 || accountName.length > 50) {
    const error = new Error(
      "Name must be 2-50 characters"
    );
    error.statusCode = 400;
    throw error;
  }

  if (!/^01[3-9]\d{8}$/.test(phone)) {
    const error = new Error(
      "Enter a valid phone number"
    );
    error.statusCode = 400;
    throw error;
  }

  const allowedMethods = [
    "bkash",
    "nagad",
    "rocket",
  ];

  if (!allowedMethods.includes(paymentMethod)) {
    const error = new Error(
      "Select bKash, Nagad or Rocket"
    );
    error.statusCode = 400;
    throw error;
  }

  if (!/^01\d{9}$/.test(accountNumber)) {
    const error = new Error(
      "Enter a valid payment account number"
    );
    error.statusCode = 400;
    throw error;
  }

  const updatedUser = await User.findByIdAndUpdate(
  userId,
  {
    $set: {
      withdrawalAccount: {
        accountName,
        phone,
        paymentMethod,
        accountNumber,
      },
    },
  },
  {
    new: true,
    runValidators: true,
  }
).select("withdrawalAccount");

if (!updatedUser) {
  const error = new Error("User not found");
  error.statusCode = 404;
  throw error;
}

return updatedUser.withdrawalAccount;
};



