const { body, validationResult } = require("express-validator");

// Register Validation
exports.registerValidator = [

    body("username")
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage("Username must be 3-20 characters"),

    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Invalid email"),

    body("phone")
        .isLength({ min: 11, max: 15 })
        .withMessage("Invalid phone number"),

    body("password")
        .trim()
        .isLength({ min: 6, max: 20 })
        .withMessage("Password must be 6-20 characters"),

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

// Login Validation
exports.loginValidator = [

    body("email")
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

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