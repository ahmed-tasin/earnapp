const asyncHandler = require("../utils/asyncHandler");
const dashboardService = require("../services/dashboardService");

// ================= USER DASHBOARD =================

exports.getUserDashboard = asyncHandler(async (req, res) => {

    const dashboard = await dashboardService.getUserDashboard(
        req.user.id
    );

    res.json({

        success: true,

        dashboard

    });

});