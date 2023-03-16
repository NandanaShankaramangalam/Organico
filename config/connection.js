const mongoose = require('mongoose');

mongoose.set('strictQuery',false)
const user = require('../model/userSchema');

mongoose.connect('mongodb://127.0.0.1:27017/organico').then(()=>{
    console.log("connection success");
})
