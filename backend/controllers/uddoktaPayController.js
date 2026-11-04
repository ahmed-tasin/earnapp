const axios = require("axios");
const mongoose = require("mongoose");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const walletService = require("../services/walletService");

const getGatewayConfig = () => {
  const baseUrl = (
    process.env.UDDOKTAPAY_BASE_URL || ""
  ).replace(/\/+$/, "");

  const apiKey = process.env.UDDOKTAPAY_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("UddoktaPay configuration is missing");
  }

  return { baseUrl, apiKey };
};

// =====================================
// CREATE CHECKOUT
// POST /api/payment/uddoktapay/checkout
// =====================================

exports.createCheckout = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (
      !Number.isFinite(amount) ||
      amount < 500 ||
      !Number.isInteger(amount)
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum deposit amount is ৳500",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { baseUrl, apiKey } = getGatewayConfig();

    const backendUrl = (
      process.env.BACKEND_URL ||
      "https://earnapp-n5b2.onrender.com"
    ).replace(/\/+$/, "");

    const frontendUrl = (
      process.env.FRONTEND_URL ||
      "https://earnapp-frontend.onrender.com"
    ).replace(/\/+$/, "");

    // প্রথমে Pending Transaction তৈরি
    const transaction = await Transaction.create({
      userId: user._id,
      type: "deposit",
      amount,
      feeAmount: 0,
      netAmount: amount,
      paymentMethod: "uddoktapay",
      paymentGateway: "uddoktapay",
      note: "UddoktaPay hosted checkout",
      status: "pending",
    });

    const payload = {
      full_name: user.name || user.username,
      email: user.email,
      amount: String(amount),

      metadata: {
        user_id: String(user._id),
        transaction_id: String(transaction._id),
      },

      redirect_url:
        `${backendUrl}/api/payment/uddoktapay/return`,

      cancel_url:
        `${frontendUrl}/deposit?payment=cancelled`,

      return_type: "GET",
    };

    const response = await axios.post(
      `${baseUrl}/checkout-v2`,
      payload,
      {
        headers: {
          "RT-UDDOKTAPAY-API-KEY": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 20000,
      }
    );

    const gatewayData =
      response.data?.data || response.data;

    const paymentUrl = gatewayData?.payment_url;

    if (
      gatewayData?.status !== true ||
      !paymentUrl ||
      !/^https:\/\//i.test(paymentUrl)
    ) {
      transaction.status = "rejected";
      await transaction.save();

      return res.status(502).json({
        success: false,
        message: "Unable to create payment checkout",
      });
    }

    if (gatewayData.invoice_id) {
      transaction.gatewayInvoiceId =
        String(gatewayData.invoice_id);

      await transaction.save();
    }

    return res.status(200).json({
      success: true,
      paymentUrl,
      transactionId: transaction._id,
    });

  } catch (error) {
    console.error(
      "UddoktaPay checkout error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Payment checkout failed. Please try again.",
    });
  }
};

// =====================================
// VERIFY PAYMENT RETURN
// GET /api/payment/uddoktapay/return
// =====================================

exports.verifyReturn = async (req, res) => {
  const frontendUrl = (
    process.env.FRONTEND_URL ||
    "https://earnapp-frontend.onrender.com"
  ).replace(/\/+$/, "");

  try {
    const invoiceId = String(
      req.query.invoice_id || ""
    ).trim();

    if (!invoiceId) {
      return res.redirect(
        `${frontendUrl}/deposit?payment=failed`
      );
    }

    const { baseUrl, apiKey } = getGatewayConfig();

    const response = await axios.post(
      `${baseUrl}/verify-payment`,
      {
        invoice_id: invoiceId,
      },
      {
        headers: {
          "RT-UDDOKTAPAY-API-KEY": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 20000,
      }
    );

    const payment =
      response.data?.data || response.data;

    if (
      String(payment?.status || "").toUpperCase() !==
      "COMPLETED"
    ) {
      return res.redirect(
        `${frontendUrl}/deposit?payment=pending`
      );
    }

    if (
      String(payment.invoice_id || "") !== invoiceId
    ) {
      return res.redirect(
        `${frontendUrl}/deposit?payment=failed`
      );
    }

    const metadata = payment.metadata || {};

    const localTransactionId =
      metadata.transaction_id;

    const metadataUserId = metadata.user_id;

    if (
      !mongoose.Types.ObjectId.isValid(localTransactionId) ||
      !mongoose.Types.ObjectId.isValid(metadataUserId)
    ) {
      return res.redirect(
        `${frontendUrl}/deposit?payment=failed`
      );
    }

    const transaction = await Transaction.findOne({
      _id: localTransactionId,
      userId: metadataUserId,
      type: "deposit",
      paymentGateway: "uddoktapay",
    });

    if (!transaction) {
      return res.redirect(
        `${frontendUrl}/deposit?payment=failed`
      );
    }

    // একই পেমেন্ট দ্বিতীয়বার credit হবে না
    if (transaction.status === "approved") {
      return res.redirect(
        `${frontendUrl}/deposit?payment=success`
      );
    }

    if (transaction.status !== "pending") {
      return res.redirect(
        `${frontendUrl}/deposit?payment=failed`
      );
    }

    const paidAmount = Number(payment.amount);
    const expectedAmount = Number(transaction.amount);

    if (
      !Number.isFinite(paidAmount) ||
      paidAmount !== expectedAmount
    ) {
      return res.redirect(
        `${frontendUrl}/deposit?payment=failed`
      );
    }

    const user = await User.findById(metadataUserId);

    if (!user) {
      return res.redirect(
        `${frontendUrl}/deposit?payment=failed`
      );
    }

    // Gateway information save
    transaction.gatewayInvoiceId = invoiceId;

    transaction.gatewayTransactionId =
      String(payment.transaction_id || "");

    transaction.gatewayPaymentMethod =
      String(payment.payment_method || "");

    await transaction.save();

    // Existing wallet service atomic credit + notification
    await walletService.approveDeposit(
      String(transaction._id)
    );

    return res.redirect(
      `${frontendUrl}/deposit?payment=success`
    );

  } catch (error) {
    console.error(
      "UddoktaPay verification error:",
      error.response?.data || error.message
    );

    return res.redirect(
      `${frontendUrl}/deposit?payment=pending`
    );
  }
};