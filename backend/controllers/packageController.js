const asyncHandler = require("../utils/asyncHandler");
const packageService = require("../services/packageService");

// Get Packages
exports.getPackages = asyncHandler(async (req, res) => {
    const packages = await packageService.getPackages();
    res.json(packages);
});

// Get Single Package
exports.getPackageDetails = asyncHandler(async (req, res) => {
    const result = await packageService.getPackageDetails(
        req.user.id,
        req.params.packageId
    );

    res.json({
        success: true,
        ...result
    });
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
    const result = await packageService.buyPackage(
        req.user.id,
        req.body.packageId,
        req.body.quantity
    );

    res.json({

        success: true,

        message: "Package purchased",

        investment: result.investment,

        investments: result.investments,

        balance: result.balance,

        quantity: result.quantity,

        purchaseCount: result.purchaseCount,

        remainingPurchaseLimit: result.remainingPurchaseLimit

    });
});