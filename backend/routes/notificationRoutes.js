const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getNotifications,
    markAsRead,
    markAllAsRead
} = require("../controllers/notificationController");

// Get All Notifications
router.get(
    "/",
    authMiddleware,
    getNotifications
);

// Mark Single Notification Read
router.put(
    "/:id/read",
    authMiddleware,
    markAsRead
);

// Mark All Notifications Read
router.put(
    "/read-all",
    authMiddleware,
    markAllAsRead
);

module.exports = router;