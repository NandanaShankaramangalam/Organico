const { default: mongoose } = require("mongoose");

const wishListData = mongoose.Schema({
    userId : {
        type : String,
        required : true
    },
    products : {
        type : Array,
        required : true
    },
   
});

const wishList = mongoose.model("wishList",wishListData).collection;

module.exports = wishList;