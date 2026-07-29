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

  body("password")
    .isString()
    .withMessage(
      "Password is required",
    )
    .trim()
    .notEmpty()
    .withMessage(
      "Password is required",
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