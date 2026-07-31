const mongoose = require("mongoose");

const Package = require("../models/Package");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const referralService = require(
  "./referralService"
);

const notificationService = require(
  "./notificationService"
);

const MAX_PACKAGE_PURCHASES = 3;

// ==============================
// GET PACKAGES
// ==============================

exports.getPackages = async () => {
  const packages =
    await Package.find({
      status: "active",
    });

  await Promise.all(
    packages.map(async (pkg) => {
      let shouldSave = false;

      if (!pkg.saleEndsAt) {
        pkg.saleEndsAt = new Date(
          Date.now() +
            (Number(
              pkg.totalDays
            ) || 0) *
              24 *
              60 *
              60 *
              1000
        );

        shouldSave = true;
      }

      if (
        pkg.totalUnits ===
        undefined
      ) {
        pkg.totalUnits = 100;

        shouldSave = true;
      }

      if (
        pkg.soldUnits ===
        undefined
      ) {
        pkg.soldUnits = 0;

        shouldSave = true;
      }

      if (shouldSave) {
        await pkg.save();
      }
    })
  );

  return packages;
};

// ==============================
// GET PACKAGE DETAILS
// ==============================

exports.getPackageDetails = async (
  userId,
  packageId
) => {
  const [pkg, user, purchaseCount] =
    await Promise.all([
      Package.findOne({
        _id: packageId,
        status: "active",
      }).lean(),

      User.findById(userId)
        .select("balance")
        .lean(),

      Investment.countDocuments({
        userId,
        packageId,
      }),
    ]);

  if (!pkg) {
    const error = new Error(
      "Package not found"
    );

    error.statusCode = 404;
    throw error;
  }

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;
    throw error;
  }

  return {
    package: pkg,
    purchaseCount,
    maxPurchases:
      MAX_PACKAGE_PURCHASES,
    remainingPurchaseLimit:
      Math.max(
        0,
        MAX_PACKAGE_PURCHASES -
          purchaseCount
      ),
    balance:
      Number(user.balance || 0),
  };
};

// ==============================
// CREATE PACKAGE
// ==============================

exports.createPackage = async (
  data
) => {
  const totalDays =
    Number(data.totalDays) || 0;

  return Package.create({
    name:
      data.name,

    amount:
      Number(data.amount),

    dailyReturn:
      Number(data.dailyReturn),

    totalDays,

    totalUnits:
      Math.max(
        1,
        Number(
          data.totalUnits
        ) || 100
      ),

    soldUnits:
      0,

    saleEndsAt:
      data.saleEndsAt ||
      new Date(
        Date.now() +
          totalDays *
            24 *
            60 *
            60 *
            1000
      ),

    status:
      "active",
  });
};

// ==============================
// BUY PACKAGE
// ==============================

exports.buyPackage = async (
  userId,
  packageId,
  requestedQuantity = 1
) => {
  const quantity =
    Number(requestedQuantity);

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_PACKAGE_PURCHASES
  ) {
    const error = new Error(
      "Quantity must be 1, 2 or 3"
    );

    error.statusCode = 400;
    throw error;
  }

  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const user =
      await User.findById(
        userId
      ).session(session);

    if (!user) {
      const error = new Error(
        "User not found"
      );

      error.statusCode = 404;

      throw error;
    }

    const pkg =
      await Package.findById(
        packageId
      ).session(session);

    if (
      !pkg ||
      pkg.status !== "active"
    ) {
      const error = new Error(
        "Package not found"
      );

      error.statusCode = 404;

      throw error;
    }

    const purchaseCount =
      await Investment.countDocuments({
        userId:
          user._id,

        packageId:
          pkg._id,
      }).session(session);

    if (
      purchaseCount + quantity >
      MAX_PACKAGE_PURCHASES
    ) {
      const remaining =
        Math.max(
          0,
          MAX_PACKAGE_PURCHASES -
            purchaseCount
        );

      const error = new Error(
        remaining > 0
          ? `You can buy only ${remaining} more unit(s) of this package`
          : "You have already reached the 3 purchase limit for this package"
      );

      error.statusCode = 400;
      throw error;
    }

    const remainingUnits =
      Math.max(
        0,
        Number(pkg.totalUnits || 0) -
          Number(pkg.soldUnits || 0)
      );

    if (
      remainingUnits < quantity
    ) {
      const error = new Error(
        remainingUnits === 0
          ? "Package is sold out"
          : `Only ${remainingUnits} package unit(s) are available`
      );

      error.statusCode = 400;

      throw error;
    }

    const unitAmount =
      Number(pkg.amount || 0);

    const totalAmount =
      unitAmount * quantity;

    if (
      Number(user.balance || 0) <
      totalAmount
    ) {
      const error = new Error(
        "Insufficient balance"
      );

      error.statusCode = 400;

      throw error;
    }

    user.balance =
      Number(user.balance || 0) -
      totalAmount;

    await user.save({
      session,
    });

    pkg.soldUnits =
      Number(pkg.soldUnits || 0) +
      quantity;

    await pkg.save({
      session,
    });

    const purchasedAt =
      new Date();

    const investmentData =
      Array.from(
        {
          length:
            quantity,
        },
        () => ({
          userId:
            user._id,

          packageId:
            pkg._id,

          investmentAmount:
            unitAmount,

          dailyReturn:
            Number(
              pkg.dailyReturn
            ),

          totalDays:
            Number(pkg.totalDays),

          remainingDays:
            Number(pkg.totalDays),

          startDate:
            purchasedAt,

          endDate:
            new Date(
              purchasedAt.getTime() +
                Number(
                  pkg.totalDays
                ) *
                  24 *
                  60 *
                  60 *
                  1000
            ),

          totalEarned:
            0,

          nextClaimAt:
            purchasedAt,

          status:
            "active",
        })
      );

    const investments =
      await Investment.create(
        investmentData,
        {
          session,
        }
      );

    await Transaction.create(
      [
        {
          userId:
            user._id,

          investmentId:
            investments[0]._id,

          type:
            "investment",

          amount:
            totalAmount,

          note:
            `Purchased ${quantity} unit(s) of ${pkg.name}`,

          status:
            "approved",
        },
      ],
      {
        session,
      }
    );

    await referralService
      .payReferralCommission(
        user._id,
        totalAmount,
        session
      );

    await notificationService
      .createNotification(
        user._id,

        "Package Purchased",

        `You purchased ${quantity} unit(s) of the ${pkg.name} package for ৳${totalAmount}.`,

        "package",

        session
      );

    await session.commitTransaction();

    return {
      investment:
        investments[0],

      investments,

      balance:
        user.balance,

      quantity,

      purchaseCount:
        purchaseCount + quantity,

      remainingPurchaseLimit:
        Math.max(
          0,
          MAX_PACKAGE_PURCHASES -
            purchaseCount -
            quantity
        ),
    };
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session
        .abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};