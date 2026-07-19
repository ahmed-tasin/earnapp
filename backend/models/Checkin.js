const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    checkinDate:Date,

    rewardAmount:Number,

    streak:Number

},{
    timestamps:true
});

module.exports = mongoose.model("Checkin",checkinSchema);