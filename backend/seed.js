require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Package = require("./models/Package");

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const defaultPackages = [
  {
    name: "Emerald",
    amount: 2000,
    dailyReturn: 3,
    totalDays: 30,
    totalUnits: 100,
  },
  {
    name: "Ruby",
    amount: 3000,
    dailyReturn: 5,
    totalDays: 30,
    totalUnits: 100,
  },
  {
    name: "Sapphire",
    amount: 5000,
    dailyReturn: 8,
    totalDays: 30,
    totalUnits: 100,
  },
  {
    name: "Titanium",
    amount: 10000,
    dailyReturn: 16,
    totalDays: 30,
    totalUnits: 100,
  },
  {
    name: "Elite",
    amount: 20000,
    dailyReturn: 32,
    totalDays: 30,
    totalUnits: 100,
  },
  {
    name: "Crown",
    amount: 50000,
    dailyReturn: 80,
    totalDays: 30,
    totalUnits: 100,
  },
];

const seedPackages = async () => {
  try {
    await connectDB();

    let createdCount = 0;
    let skippedCount = 0;

    for (const packageData of defaultPackages) {
      const existingPackage = await Package.findOne({
        name: packageData.name,
      });

      if (existingPackage) {
        console.log(
          `Skipped: ${packageData.name} already exists`
        );

        skippedCount += 1;
        continue;
      }

      await Package.create({
        ...packageData,
        soldUnits: 0,
        saleEndsAt: new Date(
          Date.now() +
            packageData.totalDays * DAY_IN_MS
        ),
        status: "active",
      });

      console.log(`Created: ${packageData.name}`);

      createdCount += 1;
    }

    console.log("------------------------------");
    console.log(`Created packages: ${createdCount}`);
    console.log(`Skipped packages: ${skippedCount}`);
    console.log("Package seeding completed");
  } catch (error) {
    console.error(
      "Package seeding failed:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedPackages();