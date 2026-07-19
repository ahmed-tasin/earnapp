const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/userService");

// ================= GET PROFILE =================

exports.getProfile = asyncHandler(async (req, res) => {

    const user = await userService.getProfile(req.user.id);

    res.status(200).json({
        success: true,
        user
    });

});

// ================= UPDATE PROFILE =================

exports.updateProfile = asyncHandler(async (req, res) => {

    const user = await userService.updateProfile(
        req.user.id,
        req.body
    );

    res.json({
        success: true,
        message: "Profile updated successfully",
        user
    });

});

// ================= CHANGE PASSWORD =================

exports.changePassword = asyncHandler(async (req, res) => {

    await userService.changePassword(
        req.user.id,
        req.body
    );

    res.json({
        success: true,
        message: "Password changed successfully"
    });

});

// ================= DASHBOARD =================

exports.getDashboard = asyncHandler(async (req, res) => {

    const dashboard = await userService.getDashboard(req.user.id);

    res.json({
        success: true,
        dashboard
    });

});