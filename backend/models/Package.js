const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({

    name:String,

    amount:Number,

    dailyReturn:Number,

    totalDays:Number,

    totalUnits: {
        type: Number,
        min: 1,
        default: 100
    },

    soldUnits: {
        type: Number,
        min: 0,
        default: 0
    },

    saleEndsAt: {
        type: Date
    },

    status:{
        type:String,
        enum:["active","inactive"],
        default:"active"
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Package",packageSchema);