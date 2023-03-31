const { default: mongoose } = require("mongoose");

const couponData = mongoose.Schema({
    couponId : {
        type : String,
        required : true
    },
    expiryDate : {
        type : Date,
        required : true
    },
    items : {
        type : Number,
        required : true
    },
    minAmount : {
        type : Number,
        required : true
    },
    discountType : {
        type : String,
        required : true
    },
    discount : {
        type : Number,
        required : true
    },
    status : {
        type : Boolean,
        required : true
    }
});

const coupon = mongoose.model("coupon",couponData).collection;

module.exports = coupon;