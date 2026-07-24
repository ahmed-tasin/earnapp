const { body, validationResult } = require("express-validator");

// Deposit Validation
exports.depositValidator = [

    body("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be greater than 0"),

    body("paymentMethod")
        .notEmpty()
        .withMessage("Payment method is required"),

    body("trxId")
        .trim()
        .notEmpty()
        .withMessage("Transaction ID is required"),

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

// Withdraw Validation
exports.withdrawValidator = [

    body("amount")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be greater than 0"),

    body("paymentMethod")
        .notEmpty()
        .withMessage("Payment method is required"),

    body("accountNumber")
        .trim()
        .notEmpty()
        .withMessage("Account number is required"),

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