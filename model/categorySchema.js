const { default: mongoose } = require("mongoose");

const categoryData = mongoose.Schema({
    category : {
        type : String,
        required : true
    },
   
});

const category = mongoose.model("category",categoryData).collection;

module.exports = category;