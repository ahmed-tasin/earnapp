const cron = require("node-cron");

const profitService = require(
  "../services/profitService",
);

const startDailyProfitCron = () => {
  cron.schedule(
    "5 0 * * *",
    async () => {
      try {
        console.log(
          "Daily profit cron started",
        );

        const result =
          await profitService.runDailyProfit();

        console.log(
          "Daily profit cron completed:",
          result,
        );
      } catch (error) {
        console.error(
          "Daily profit cron failed:",
          error.message,
        );
      }
    },
    {
      timezone: "Asia/Dhaka",
    },
  );
};

module.exports = startDailyProfitCron;