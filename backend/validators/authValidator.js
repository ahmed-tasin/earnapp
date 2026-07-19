const {body}=require("express-validator");

exports.registerValidation=[

body("username")

.notEmpty()

.withMessage("Username required"),

body("email")

.isEmail()

.withMessage("Invalid email"),

body("password")

.isLength({min:6})

.withMessage("Password minimum 6 characters")

];