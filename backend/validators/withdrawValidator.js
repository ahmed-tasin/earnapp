const {
  body,
  validationResult,
} = require("express-validator");

exports.validateWithdraw = [
  body("amount")
    .notEmpty()
    .withMessage(
      "Withdraw amount is required",
    )
    .isFloat({
      gt: 0,
    })
    .withMessage(
      "Withdraw amount must be greater than zero",
    ),

  body("paymentMethod")
    .trim()
    .notEmpty()
    .withMessage(
      "Payment method is required",
    )
    .isIn([
      "bkash",
      "nagad",
      "rocket",
      "bank",
    ])
    .withMessage(
      "Invalid payment method",
    ),

  body("accountNumber")
    .trim()
    .notEmpty()
    .withMessage(
      "Account number is required",
    )
    .isLength({
      min: 5,
      max: 50,
    })
    .withMessage(
      "Invalid account number",
    ),

  (req, res, next) => {
    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message:
          errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    next();
  },
];