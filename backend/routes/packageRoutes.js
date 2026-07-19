const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {

    getPackages,

    createPackage,

    buyPackage

} = require("../controllers/packageController");

router.get("/", getPackages);

router.post(
    "/create",
    authMiddleware,
    adminMiddleware,
    createPackage
);

router.post(
    "/buy",
    authMiddleware,
    buyPackage
);

module.exports = router;