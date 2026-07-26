const checkinService = require("../services/checkinService");

const getCheckin = async (req, res, next) => {
  try {
    const result = await checkinService.getCheckinStatus(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const dailyCheckin = async (req, res, next) => {
  try {
    const result = await checkinService.performDailyCheckin(
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Daily check-in successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getCheckinHistory = async (req, res, next) => {
  try {
    const history = await checkinService.getCheckinHistory(
      req.user.id
    );

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCheckin,
  dailyCheckin,
  getCheckinHistory,
};