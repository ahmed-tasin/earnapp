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

const errorMiddleware = require("./middleware/errorMiddleware");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");

const app = express();

app.use(cors({
    origin: [
        "http://localhost:3000",
        process.env.FRONTEND_URL
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/profit", profitRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);


app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        message: err.message

    });

});



module.exports = app;