const { default: mongoose } = require("mongoose");

const adminData = mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
   
});

const admin = mongoose.model("admin",adminData).collection;

module.exports = admin;