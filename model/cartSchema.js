const { default: mongoose } = require("mongoose");

const cartData = mongoose.Schema({
    userId : {
        type : String,
        required : true
    },
    products : {
        type : Array,
        required : true
    },
   
});

const cart = mongoose.model("cart",cartData).collection;

module.exports = cart;