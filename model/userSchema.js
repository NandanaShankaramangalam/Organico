const { default: mongoose } = require("mongoose");

const userData = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone : {
        type : Number,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    status : {
        type : Boolean,
        required : true
    },
    address : {
        type : Array,
        required : true
    }
});

const userCollection = mongoose.model("User",userData).collection;

module.exports = userCollection;