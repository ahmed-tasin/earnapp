const { body, validationResult } = require("express-validator");
const normalizePhone = require("../utils/normalizePhone");

const sendValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }

    next();
};

// Register Validation
exports.registerValidator = [

    body("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be 2-50 characters"),

    body("phone")
        .customSanitizer(normalizePhone)
        .matches(/^01[3-9]\d{8}$/)
        .withMessage("Enter a valid Bangladesh phone number"),

    body("password")
        .isLength({ min: 6, max: 20 })
        .withMessage("Password must be 6-20 characters"),

    body("confirmPassword")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Password and Confirm Password do not match"),

    body("referralCode")
        .optional({ checkFalsy: true })
        .trim()
        .toUpperCase(),

    sendValidationErrors

];

// Login Validation
exports.loginValidator = [

    body("phone")
        .customSanitizer(normalizePhone)
        .matches(/^01[3-9]\d{8}$/)
        .withMessage("Enter a valid Bangladesh phone number"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    sendValidationErrors

];