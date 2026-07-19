const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

// ================= REGISTER =================

exports.register = asyncHandler(async (req, res) => {

    const result = await authService.register(req.body);

    res.status(201).json({

        success: true,

        token: result.token,

        user: result.user

    });

});

// ================= LOGIN =================

exports.login = asyncHandler(async (req, res) => {

    const result = await authService.login(req.body);

    res.json({

        success: true,

        token: result.token,

        user: result.user

    });

});