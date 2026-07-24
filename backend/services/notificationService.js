const Notification = require("../models/Notification");

// ================= CREATE =================

exports.createNotification = async (
    userId,
    title,
    message,
    type = "system",
    session = null
) => {
    const notificationData = {
        userId,
        title,
        message,
        type
    };

    if (session) {
        const notifications = await Notification.create(
            [notificationData],
            { session }
        );

        return notifications[0];
    }

    return await Notification.create(notificationData);
};

// ================= GET =================

exports.getNotifications = async (userId) => {

    return await Notification.find({

        userId

    })
        .sort({
            createdAt: -1
        });

};

// ================= MARK READ =================

exports.markAsRead = async (
    notificationId,
    userId
) => {

    return await Notification.findOneAndUpdate(

        {
            _id: notificationId,
            userId
        },

        {
            isRead: true
        },

        {
            new: true
        }

    );

};

// ================= MARK ALL =================

exports.markAllAsRead = async (userId) => {

    await Notification.updateMany(

        {
            userId,
            isRead: false
        },

        {
            isRead: true
        }

    );

    return true;

};