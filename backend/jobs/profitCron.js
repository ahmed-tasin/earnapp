const cron = require("node-cron");
const profitService = require("../services/profitService");

const startProfitCron = () => {

    // প্রতিদিন রাত 12:00 টায় চলবে
    cron.schedule("0 0 * * *", async () => {

        console.log("========== DAILY PROFIT START ==========");

        try {

            const result = await profitService.runDailyProfit();

            console.log(
                `Daily Profit Completed. Processed: ${result.processed}`
            );

        } catch (err) {

            console.error("Profit Cron Error:", err.message);

        }

        console.log("========== DAILY PROFIT END ==========");

    });

};

module.exports = startProfitCron;