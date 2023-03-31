const { default: mongoose } = require("mongoose");

const orderData = mongoose.Schema({
    deliveryDetails : {
        type : Object,
        required : true
    },
    userId : {
        type : String,
        required : true
    },
    paymentMethod : {
        type : String,
        required : true
    },
    products : {
        type : Array,
        required : true
    },
    totalAmount : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    orderStatus : {
        type : String,
        required : true
    },
    month : {
        type : Number,
        required : true
    }
   
});

const order = mongoose.model("order",orderData).collection;

module.exports = order;