const express = require("express");
const router = express.Router();
const { registerValidator, loginValidator } = require("../validators/authValidator");


const {

    register,

    login

} = require("../controllers/authController");

router.post("/register", registerValidator, register);

router.post("/login", loginValidator, login);

module.exports = router;