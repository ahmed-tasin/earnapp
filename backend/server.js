require("dotenv").config();

const app = require("./app");
app.set("trust proxy", 1); // Trust first proxy for rate limiting
const connectDB = require("./config/db");

const startDailyProfitCron = require("./cron/dailyProfitCron");

require("./models/User");
require("./models/Package");
require("./models/Investment");
require("./models/Transaction");
require("./models/Checkin");
require("./models/ReferralCommission");
require("./config/env");

const startProfitCron = require("./jobs/profitCron");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    startDailyProfitCron();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server Start Error:", err);

    process.exit(1);
  }
};

startServer();
