const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const packageRoutes = require("./routes/packageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const referralRoutes = require("./routes/referralRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const walletRoutes = require("./routes/walletRoutes");
const profitRoutes = require("./routes/profitRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const allowedOrigins = [
  "http://localhost:3000",
  "https://earnapp-frontend.onrender.com",
];


const errorMiddleware = require("./middleware/errorMiddleware");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");


const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman/server requests may not contain an origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    optionsSuccessStatus: 204,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

app.use(express.json({ limit: "1mb" })); // Limit request body to 1mb
app.use(express.urlencoded({ extended: true, limit: "1mb" })); // Limit URL-encoded data to 1mb
app.use(helmet());
// app.use(mongoSanitize());
app.use(limiter);
app.disable("x-powered-by"); // Hide Express header for security



app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/profit", profitRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);



module.exports = app;
