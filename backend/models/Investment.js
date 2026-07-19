const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    packageId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Package"
    },

    investmentAmount:Number,

    dailyReturn:Number,

    totalDays:Number,

    remainingDays:Number,

    startDate:Date,

    endDate:Date,

    totalEarned:{
        type:Number,
        default:0
    },

    lastProfitDate: {
    type: Date,
    default: null
    },

    status:{
        type:String,
        enum:["active","completed","cancelled"],
        default:"active"
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Investment",investmentSchema);