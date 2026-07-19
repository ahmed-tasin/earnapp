const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({

    name:String,

    amount:Number,

    dailyReturn:Number,

    totalDays:Number,

    status:{
        type:String,
        enum:["active","inactive"],
        default:"active"
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Package",packageSchema);