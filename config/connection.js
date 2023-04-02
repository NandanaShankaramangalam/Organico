const mongoose = require('mongoose');
require('dotenv').config();
mongoose.set('strictQuery',false)
const user = require('../model/userSchema');

mongoose.connect(process.env.MONGODB).then(()=>{
    console.log("connection success");
})
