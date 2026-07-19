// middleware/adminMiddleware.js

const adminMiddleware = (req, res, next) => {
    try {
        // authMiddleware আগে চালানো হয়েছে কিনা
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first."
            });
        }

        // শুধুমাত্র Admin
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only."
            });
        }

        next();

    } catch (error) {
        console.error("Admin Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = adminMiddleware;