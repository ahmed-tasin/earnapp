const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({

    fromUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    toUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    commission:Number,

    level:Number,

    transactionAmount:Number,

    status:{
        type:String,
        enum:["pending","completed"],
        default:"completed"
    }

},{
    timestamps:true
});

module.exports = mongoose.model("ReferralCommission",referralSchema);