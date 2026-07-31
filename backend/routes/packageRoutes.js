const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { createPackageValidator } = require("../validators/packageValidator");

const {

    getPackages,

    getPackageDetails,

    createPackage,

    buyPackage

} = require("../controllers/packageController");

router.get("/", getPackages);

router.get(
    "/:packageId",
    authMiddleware,
    getPackageDetails
);

router.post(
    "/create",
    authMiddleware,
    adminMiddleware,
    createPackageValidator,
    createPackage
);

router.post(
    "/buy",
    authMiddleware,
    buyPackage
);

module.exports = router;