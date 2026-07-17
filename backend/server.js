// ============================================
// EARNING PLATFORM - MAIN SERVER
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
require('dotenv').config();
dotenv.config();




//cors


const app = express();

// ✅ CORS সক্ষম করুন
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://earnapp-frontend.onrender.com',
    process.env.FRONTEND_URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// ✅ Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));





// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://earnapp-frontend.onrender.com',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//add dns server to avoid DNS resolution issues
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1"]);

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:rmJOEfzaHH0RQat0@cluster0.bh9b2gn.mongodb.net/?appName=Cluster0', {

})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.log('❌ MongoDB Error:', err.message);
    // Fallback - use in-memory data if MongoDB fails
  });

// ==================== MODELS ====================

// User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  referralCode: { type: String, unique: true },
  referredBy: mongoose.Schema.Types.ObjectId,
  
  balance: { type: Number, default: 0 },
  totalDeposit: { type: Number, default: 0 },
  totalWithdraw: { type: Number, default: 0 },
  totalEarning: { type: Number, default: 0 },
  
  directReferrals: [mongoose.Schema.Types.ObjectId],
  referralCommissionEarned: { type: Number, default: 0 },
  
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  kycVerified: { type: Boolean, default: false },
  lastLogin: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Package Model
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  dailyReturn: { type: Number, required: true },
  totalDays: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Package = mongoose.model('Package', packageSchema);

// Investment Model
const investmentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  packageId: mongoose.Schema.Types.ObjectId,
  investmentAmount: Number,
  dailyReturn: Number,
  totalDays: Number,
  remainingDays: Number,
  startDate: Date,
  endDate: Date,
  totalEarned: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Investment = mongoose.model('Investment', investmentSchema);

// Transaction Model
const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: { type: String, enum: ['deposit', 'withdraw', 'referral', 'daily_bonus', 'package_return'] },
  amount: Number,
  method: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Checkin Model
const checkinSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  checkinDate: Date,
  rewardAmount: Number,
  streak: Number,
  createdAt: { type: Date, default: Date.now }
});

const Checkin = mongoose.model('Checkin', checkinSchema);

// Referral Commission Model
const referralSchema = new mongoose.Schema({
  fromUser: mongoose.Schema.Types.ObjectId,
  toUser: mongoose.Schema.Types.ObjectId,
  commission: Number,
  level: Number,
  transactionAmount: Number,
  status: { type: String, enum: ['pending', 'completed'], default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

const ReferralCommission = mongoose.model('ReferralCommission', referralSchema);

// ==================== MIDDLEWARE FUNCTIONS ====================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Authenticate middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== ROUTES ====================

// ===== AUTH ROUTES =====

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, phone, referralCode } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newReferralCode = `REF${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) referredBy = referrer._id;
    }
    
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
      referralCode: newReferralCode,
      referredBy,
      balance: 1000 // স্বাগত বোনাস
    });
    
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy, {
        $push: { directReferrals: newUser._id }
      });
    }
    
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'your_secret_key');
    
    res.json({ 
      token, 
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        balance: newUser.balance,
        referralCode: newUser.referralCode
      },
      message: '✅ Registration successful! Welcome bonus: ৳1000'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is suspended' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_secret_key');
    
    res.json({ 
      token, 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        totalEarning: user.totalEarning,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== USER ROUTES =====

// Get profile
app.get('/api/user/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      balance: user.balance,
      totalDeposit: user.totalDeposit,
      totalWithdraw: user.totalWithdraw,
      totalEarning: user.totalEarning,
      referralCode: user.referralCode,
      directReferrals: user.directReferrals.length,
      referralCommissionEarned: user.referralCommissionEarned,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PACKAGE ROUTES =====

// Get all packages
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await Package.find({ status: 'active' });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create package (Admin)
app.post('/api/packages/create', authenticate, async (req, res) => {
  try {
    const { name, amount, dailyReturn, totalDays } = req.body;
    
    const newPackage = await Package.create({
      name,
      amount,
      dailyReturn,
      totalDays,
      status: 'active'
    });
    
    res.json({ message: '✅ Package created', package: newPackage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== INVESTMENT ROUTES =====

// Buy package
app.post('/api/packages/buy', authenticate, async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    const pkg = await Package.findById(packageId);
    
    if (!pkg || pkg.status !== 'active') {
      return res.status(400).json({ error: 'Package not available' });
    }
    
    if (user.balance < pkg.amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Deduct from balance
    user.balance -= pkg.amount;
    await user.save();
    
    // Create investment
    const investment = await Investment.create({
      userId,
      packageId,
      investmentAmount: pkg.amount,
      dailyReturn: pkg.dailyReturn,
      totalDays: pkg.totalDays,
      remainingDays: pkg.totalDays,
      startDate: new Date(),
      endDate: new Date(Date.now() + pkg.totalDays * 24 * 60 * 60 * 1000),
      status: 'active',
      totalEarned: 0
    });
    
    // Process referral commission
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        const commission = pkg.amount * 0.10; // 10% commission
        referrer.referralCommissionEarned += commission;
        referrer.balance += commission;
        await referrer.save();
        
        await ReferralCommission.create({
          fromUser: user.referredBy,
          toUser: userId,
          commission,
          level: 1,
          transactionAmount: pkg.amount,
          status: 'completed'
        });
      }
    }
    
    res.json({ 
      message: '✅ Package purchased successfully!',
      investment,
      remainingBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user investments
app.get('/api/investments', authenticate, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id }).populate('packageId');
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PAYMENT ROUTES =====

// Deposit (simulate SSLCommerz)
app.post('/api/payment/deposit', authenticate, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const userId = req.user.id;
    
    if (amount < 100) {
      return res.status(400).json({ error: 'Minimum deposit: ৳100' });
    }
    
    const transaction = await Transaction.create({
      userId,
      type: 'deposit',
      amount,
      method,
      status: 'pending',
      transactionId: `DEP${Date.now()}`
    });
    
    res.json({
      status: 'success',
      message: 'Deposit initiated',
      transactionId: transaction.transactionId,
      amount,
      method,
      redirectUrl: `https://www.sslcommerz.com` // Real payment gateway
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm deposit (after payment)
app.post('/api/payment/confirm', authenticate, async (req, res) => {
  try {
    const { transactionId, amount } = req.body;
    const userId = req.user.id;
    
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    transaction.status = 'completed';
    await transaction.save();
    
    const user = await User.findById(userId);
    user.balance += amount;
    user.totalDeposit += amount;
    await user.save();
    
    res.json({ 
      message: '✅ Deposit successful!',
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw
app.post('/api/payment/withdraw', authenticate, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    if (amount < 200) {
      return res.status(400).json({ error: 'Minimum withdraw: ৳200' });
    }
    
    const transaction = await Transaction.create({
      userId,
      type: 'withdraw',
      amount,
      method,
      status: 'pending',
      transactionId: `WD${Date.now()}`
    });
    
    user.balance -= amount;
    await user.save();
    
    res.json({ 
      message: '✅ Withdraw request submitted',
      transactionId: transaction.transactionId,
      estimatedTime: '1-3 hours',
      remainingBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DAILY CHECK-IN =====

app.post('/api/checkin', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toDateString();
    
    const existingCheckin = await Checkin.findOne({
      userId,
      checkinDate: { 
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (existingCheckin) {
      return res.status(400).json({ error: 'Already checked in today' });
    }
    
    const lastCheckin = await Checkin.findOne({ userId }).sort({ createdAt: -1 });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let streak = 1;
    if (lastCheckin && lastCheckin.checkinDate.toDateString() === yesterday.toDateString()) {
      streak = lastCheckin.streak + 1;
    }
    
    const rewardAmount = 10 + (streak >= 7 ? 5 : 0); // ৳10 + ৳5 bonus if 7 days
    
    const checkin = await Checkin.create({
      userId,
      checkinDate: new Date(),
      rewardAmount,
      streak
    });
    
    const user = await User.findById(userId);
    user.balance += rewardAmount;
    user.totalEarning += rewardAmount;
    await user.save();
    
    res.json({ 
      message: '✅ Checked in successfully!',
      reward: rewardAmount,
      streak,
      bonus: streak >= 7 ? 5 : 0,
      totalBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== REFERRAL ROUTES =====

app.get('/api/referral/info', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    const commissions = await ReferralCommission.find({ fromUser: userId }).limit(10);
    
    res.json({
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?ref=${user.referralCode}`,
      directReferrals: user.directReferrals.length,
      totalCommission: user.referralCommissionEarned,
      recentCommissions: commissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TRANSACTION HISTORY =====

app.get('/api/transactions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SEED PACKAGES (Run once) =====

app.post('/api/seed-packages', async (req, res) => {
  try {
    const existingPackages = await Package.find();
    
    if (existingPackages.length > 0) {
      return res.json({ message: 'Packages already exist' });
    }
    
    const packages = [
      { name: 'Bronze', amount: 500, dailyReturn: 1, totalDays: 30, status: 'active' },
      { name: 'Silver', amount: 1000, dailyReturn: 1.5, totalDays: 30, status: 'active' },
      { name: 'Gold', amount: 5000, dailyReturn: 2, totalDays: 30, status: 'active' },
      { name: 'Platinum', amount: 10000, dailyReturn: 2.5, totalDays: 30, status: 'active' }
    ];
    
    await Package.insertMany(packages);
    res.json({ message: '✅ Packages seeded', count: packages.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ERROR HANDLING =====

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 EARNING PLATFORM SERVER            ║
║  PORT: ${PORT}                          ║
║  STATUS: ✅ Running                     ║
╚════════════════════════════════════════╝
  `);
  
  console.log('📡 Endpoints Ready:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/user/profile');
  console.log('   GET  /api/packages');
  console.log('   POST /api/packages/buy');
  console.log('   POST /api/payment/deposit');
  console.log('   POST /api/payment/withdraw');
  console.log('   POST /api/checkin');
  console.log('   GET  /api/referral/info');
});

module.exports = app;
