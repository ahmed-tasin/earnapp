require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

require("./models/User");
require("./models/Package");
require("./models/Investment");
require("./models/Transaction");
require("./models/Checkin");
require("./models/ReferralCommission");

const startProfitCron = require("./jobs/profitCron");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {

        await connectDB();

        startProfitCron();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {

        console.error("❌ Server Start Error:", err);

        process.exit(1);

    }
};

startServer();