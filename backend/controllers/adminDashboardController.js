const asyncHandler = require("../utils/asyncHandler");
const adminDashboardService = require("../services/adminDashboardService");
const getUserDetails = require("../services/adminDashboardService").getUserDetails;
const getUsers = require("../services/adminDashboardService").getUsers;

const Investment = require("../models/Investment");


exports.getAdminDashboard = asyncHandler(async (req, res) => {

    const dashboard =
        await adminDashboardService.getAdminDashboard();

    res.json({

        success: true,

        dashboard

    });

});


exports.getUsers = asyncHandler(async (req, res) => {
    const result = await adminDashboardService.getUsers({
        page: req.query.page,
        limit: req.query.limit,
        phone: req.query.phone,
        status: req.query.status,
        role: req.query.role,
        sort: req.query.sort
    });

    res.status(200).json({
        success: true,
        ...result
    });
});


exports.getUserDetails = asyncHandler(async (req, res) => {

    const result =
        await adminDashboardService.getUserDetails(
            req.params.id
        );

    res.json({
        success: true,
        ...result
    });

});

exports.suspendUser = asyncHandler(async (req, res) => {
    const user = await adminDashboardService.suspendUser(
        req.params.id,
        req.user.id
    );

    res.status(200).json({
        success: true,
        message: "User suspended successfully",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status
        }
    });
});

exports.activateUser = asyncHandler(async (req, res) => {
    const user = await adminDashboardService.activateUser(
        req.params.id
    );

    res.status(200).json({
        success: true,
        message: "User activated successfully",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status
        }
    });
});


exports.updateUser = asyncHandler(async (req, res) => {
    const user = await adminDashboardService.updateUser(
        req.params.id,
        req.body,
        req.user.id
    );

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        user
    });
});

exports.getAllInvestments = async () => {
  return await Investment.find()
    .populate("userId", "username phone")
    .populate("packageId", "name")
    .sort({ createdAt: -1 });
};
