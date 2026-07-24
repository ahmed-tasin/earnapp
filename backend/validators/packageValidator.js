const { body, validationResult } = require("express-validator");

// Create Package Validation
exports.createPackageValidator = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Package name is required"),

    body("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be greater than 0"),

    body("dailyReturn")
        .isFloat({ gt: 0 })
        .withMessage("Daily return must be greater than 0"),

    body("totalDays")
        .isInt({ gt: 0 })
        .withMessage("Total days must be greater than 0"),

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        next();
    }

];