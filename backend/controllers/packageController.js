const asyncHandler = require("../utils/asyncHandler");
const packageService = require("../services/packageService");

// Get Packages
exports.getPackages = asyncHandler(async (req, res) => {
    const packages = await packageService.getPackages();
    res.json(packages);
});

// Create Package
exports.createPackage = asyncHandler(async (req, res) => {
    const pkg = await packageService.createPackage(req.body);

    res.status(201).json({
        success: true,
        message: "Package created",
        package: pkg
    });
});

// Buy Package
exports.buyPackage = asyncHandler(async (req, res) => {

console.log("BODY:", req.body);
    console.log("HEADERS:", req.headers);

    const result = await packageService.buyPackage(
        req.user.id,
        req.body.packageId
    );

    res.json({

        success: true,

        message: "Package purchased",

        investment: result.investment,

        balance: result.balance

    });
});