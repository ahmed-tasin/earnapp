const Checkin = require("../models/Checkin");
const User = require("../models/User");
const notificationService = require("./notificationService");

const REWARD_DAYS = [
  { day: 1, reward: 2 },
  { day: 2, reward: 2 },
  { day: 3, reward: 4 },
  { day: 4, reward: 4 },
  { day: 5, reward: 5 },
  { day: 6, reward: 5 },
  { day: 7, reward: 10 },
];

const getRewardForDay = (day) => {
  const reward = REWARD_DAYS.find((item) => item.day === day);
  return reward ? reward.reward : 0;
};

exports.getCheckinStatus = async (userId) => {
  const user = await User.findById(userId).select("balance");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const checkins = await Checkin.find({ userId }).sort({ checkinDate: -1 }).lean();

  const latestCheckin = checkins[0] || null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastCheckinDate = latestCheckin?.checkinDate
    ? new Date(latestCheckin.checkinDate)
    : null;

  if (lastCheckinDate) {
    lastCheckinDate.setHours(0, 0, 0, 0);
  }

  const todayCheckedIn = Boolean(
    lastCheckinDate && lastCheckinDate.getTime() === today.getTime()
  );

  const streak = latestCheckin?.streak || 0;
  const totalReward = checkins.reduce((sum, entry) => sum + Number(entry.rewardAmount || 0), 0);

  const currentDay = todayCheckedIn ? Math.min(streak, 7) : Math.min(Math.max(streak, 0), 7);

  return {
    currentDay,
    streak,
    totalReward,
    todayCheckedIn,
    lastCheckIn: latestCheckin?.checkinDate || null,
    balance: Number(user.balance || 0),
  };
};

exports.performDailyCheckin = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const latestCheckin = await Checkin.findOne({ userId }).sort({ checkinDate: -1 });

  if (latestCheckin) {
    const lastCheckinDate = new Date(latestCheckin.checkinDate);
    lastCheckinDate.setHours(0, 0, 0, 0);

    if (lastCheckinDate.getTime() === today.getTime()) {
      const error = new Error("You already checked in today");
      error.statusCode = 400;
      throw error;
    }
  }

  let streak = 1;

  if (latestCheckin) {
    const lastCheckinDate = new Date(latestCheckin.checkinDate);
    lastCheckinDate.setHours(0, 0, 0, 0);

    if (lastCheckinDate.getTime() === yesterday.getTime()) {
      streak = Number(latestCheckin.streak || 0) + 1;
    }
  }

  const rewardAmount = getRewardForDay(Math.min(streak, 7));

  const checkin = await Checkin.create({
    userId,
    checkinDate: new Date(),
    rewardAmount,
    streak,
  });

  user.balance = Number(user.balance || 0) + rewardAmount;
  user.totalEarning = Number(user.totalEarning || 0) + rewardAmount;
  await user.save();

  await notificationService.createNotification(
    user._id,
    "Daily Check-in",
    `You received ৳${rewardAmount} for your daily check-in.`,
    "checkin"
  );

  return {
    success: true,
    message: "Daily check-in successful",
    reward: rewardAmount,
    checkIn: {
      currentDay: Math.min(streak, 7),
      streak,
      totalReward: rewardAmount,
      todayCheckedIn: true,
      lastCheckIn: checkin.checkinDate,
    },
    wallet: {
      balance: Number(user.balance || 0),
    },
  };
};

exports.getCheckinHistory = async (userId) => {
  const history = await Checkin.find({ userId }).sort({ checkinDate: -1 }).lean();
  return history;
};
