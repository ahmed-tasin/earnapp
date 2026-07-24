const asyncHandler = require("../utils/asyncHandler");
const notificationService = require("../services/notificationService");

// ================= GET NOTIFICATIONS =================

exports.getNotifications = asyncHandler(async (req, res) => {

    const notifications =
        await notificationService.getNotifications(req.user.id);

    res.json({
        success: true,
        notifications
    });

});

// ================= MARK AS READ =================

exports.markAsRead = asyncHandler(async (req, res) => {

    const notification =
        await notificationService.markAsRead(
            req.params.id,
            req.user.id
        );

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: "Notification not found"
        });
    }

    res.json({
        success: true,
        message: "Notification marked as read",
        notification
    });

});

// ================= MARK ALL AS READ =================

exports.markAllAsRead = asyncHandler(async (req, res) => {

    await notificationService.markAllAsRead(req.user.id);

    res.json({
        success: true,
        message: "All notifications marked as read"
    });

});