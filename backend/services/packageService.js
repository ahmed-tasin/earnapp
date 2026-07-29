const mongoose = require("mongoose");

const Package = require("../models/Package");
const Investment = require("../models/Investment");
const User = require("../models/User");

const referralService = require(
  "./referralService"
);

const notificationService = require(
  "./notificationService"
);

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
  packageId
) => {
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

    if (
      Number(pkg.soldUnits || 0) >=
      Number(pkg.totalUnits || 0)
    ) {
      const error = new Error(
        "Package is sold out"
      );

      error.statusCode = 400;

      throw error;
    }

    if (
      Number(user.balance || 0) <
      Number(pkg.amount || 0)
    ) {
      const error = new Error(
        "Insufficient balance"
      );

      error.statusCode = 400;

      throw error;
    }

    user.balance =
      Number(user.balance || 0) -
      Number(pkg.amount || 0);

    await user.save({
      session,
    });

    pkg.soldUnits =
      Number(pkg.soldUnits || 0) +
      1;

    await pkg.save({
      session,
    });

    const purchasedAt =
      new Date();

    const investments =
      await Investment.create(
        [
          {
            userId:
              user._id,

            packageId:
              pkg._id,

            investmentAmount:
              Number(pkg.amount),

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

            /*
             * Package কেনার দিনই
             * প্রথম profit claim
             * করা যাবে।
             */
            nextClaimAt:
              purchasedAt,

            status:
              "active",
          },
        ],
        {
          session,
        }
      );

    const investment =
      investments[0];

    await referralService
      .payReferralCommission(
        user._id,
        Number(pkg.amount),
        session
      );

    await notificationService
      .createNotification(
        user._id,

        "Package Purchased",

        `You successfully purchased the ${pkg.name} package for ৳${pkg.amount}.`,

        "package",

        session
      );

    await session.commitTransaction();

    return {
      investment,

      balance:
        user.balance,
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