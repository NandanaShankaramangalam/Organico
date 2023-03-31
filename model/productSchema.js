const { default: mongoose } = require("mongoose");

const productData = mongoose.Schema({
    productName : {
        type : String,
        required : true
    },
    brand : {
        type : String,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    stock : {
        type : Number,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    Image : {
        type : Array,
        required : true
    },
    status : {
    type : Boolean,
    required : true
    }
});

const product = mongoose.model("Product",productData).collection;

module.exports = product;