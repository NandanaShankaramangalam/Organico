const userCollection = require('../model/userSchema');
const product = require('../model/productSchema');
const cart = require('../model/cartSchema');
const orders = require('../model/orderSchema');
var bcrypt = require('bcrypt');
var uuid = require('uuid');
const nodemailer=require('nodemailer');
const { default: mongoose } = require('mongoose');
const { response } = require('express');
const order = require('../model/orderSchema');
require('dotenv').config();
// const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;


function getCartCount(userId){
  return new Promise(async(resolve, reject) => {
    let count = 0;
    let userCart = await cart.findOne({userId:ObjectId(userId)});
    if(userCart){
      count = userCart.products.length;
    }
    resolve(count);
  })
 }

module.exports = {
    getHome : async(req,res)=>{
      let user=req.session.user;
      let cartCount = null;
      let products = await product.find().toArray();
      if(user){ 
        req.session.cartCount = await getCartCount(req.session.user._id);
     }
     res.render('user/home',{products,user,cartCount:req.session.cartCount});
    },
    userSignup : (req,res)=>{
        errMsg = req.session.errMsg;
        res.render('user/user-signup',{errMsg});
        req.session.errMsg = null;
    },
    insertUser : async(req,res)=>{
        let userInfo = req.body;
        console.log(userInfo);
            var nameRegex = /^([A-Za-z ]){5,25}$/gm;
            var emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            var passwordRegex=/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,16}/gm;
            var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            var validateEmail = await user.findOne({email : userInfo.email});
            if(userInfo.name == ''){
               req.session.errMsg = "Name field is empty!";
               res.redirect('/user-signup');
            }
            else if(nameRegex.test(userInfo.name) != true){
              req.session.errMsg = "Invalid name format";
              res.redirect('/user-signup');
            }
            else if(userInfo.email == ''){
               req.session.errMsg = "Email field is empty!";
               res.redirect('/user-signup');
            }
            else if(validateEmail){
               req.session.errMsg = "Email already exist!";
               res.redirect('/user-signup');
            }
            else if(emailRegex.test(userInfo.email) != true){
              req.session.errMsg = "Invalid email format";
              res.redirect('/user-signup');
            }
            else if(userInfo.phone == ''){
              req.session.errMsg = "Phone number field is empty!";
              res.redirect('/user-signup');
            }
            else if(phoneRegex.test(userInfo.phone) != true){
              req.session.errMsg = "Invalid phone number format";
              res.redirect('/user-signup');
            }
            else if(userInfo.password == ''){
              req.session.errMsg = "Password field is empty!";
              res.redirect('/user-signup');
            }
            else if(passwordRegex.test(userInfo.password) != true){
              req.session.errMsg = "Password should contain minimum 8 characters, 1 uppercase letter, lowercase letter and a number";
              res.redirect('/user-signup');
            }
            else if(userInfo.confirmpassword == ''){
                req.session.errMsg = "Confirm password field is empty!";
                res.redirect('/user-signup');
              }
            else if(userInfo.password != userInfo.confirmpassword){
              req.session.errMsg = "Passwords doesn't match!";
              res.redirect('/user-signup');
            }
            else{
              const userData = {
                name : userInfo.name,
                email : userInfo.email,
                phone : userInfo.phone,
                password : userInfo.password, 
                status : true
              }
              userData.password = await bcrypt.hash(userData.password,10);
              await user.insertOne(userData).then((data)=>{
                console.log(data); 
              });
              req.session.user = req.body;
              res.redirect('/');
            }        
    },
    userLogin : async(req,res)=>{
        var user = req.session.user;
  if(user){
    res.redirect('/');
  }
  else{
    err = req.session.err;
    res.render('user/user-login',{err});
    req.session.err = null;
  }
    },
    userCheck : async(req,res)=>{
        let userInfo = req.body;
        var response = {};
            var users = await userCollection.findOne({email : userInfo.email});
            if(users){
              if(users.status){
              bcrypt.compare(userInfo.password,users.password).then((status)=>{
               if(status){
                  console.log(status);
                  response.user = users;
                  response.status = true;
                  console.log("Login Successfull");
                  req.session.user = response.user;
                  res.redirect('/');
               }
               else{
                response.msg = "Invalid Password!";
                console.log(response.msg);
                req.session.err = response.msg;
                res.redirect('/user-login');
            }
            })
          }
          else{
            response.msg = "Your account has been blocked!";
            req.session.err = response.msg;
            res.redirect('/user-login');
          }
        }
            else{
                response.msg = "Invalid Email!";
                req.session.err = response.msg;
                res.redirect('/user-login');
            }
},
getOtpLogin : async(req,res)=>{
  var user=req.session.user
  if(user){
    res.redirect('/')
  }else{
  otp=req.session.otp
  data=req.session.otpData
  err=req.session.otpErr
  invalid=req.session.InvalidOtp
  res.render('user/otp-login',{otp,data,err,invalid})
  req.session.otpErr=null
  req.session.otpData = null;
  }
},
selectAddress : async(req,res)=>{
  id = req.params.id;
  let userId = req.session.user._id;
  let selectedAddress = await user.aggregate([
    {
      $match : {_id:ObjectId(userId)}
    },
    {
      $unwind : '$address'
    },
    {
      $match : {'address.id':id}
    },
  ]).toArray();
  console.log(selectedAddress);
  let data = selectedAddress[0].address;
  let name = selectedAddress[0].address.name;
  let arr = name.split(' ');
console.log(data);
  let address = {
    fname : arr[0],
    lname : arr[1],
    street : data.street,
    state : data.state,
    town : data.town,
    zip : data.zip,
    phone: data.phone,
    email : data.email
  }
  console.log("this address = ",address);
  req.session.selectedAddress = address;
  console.log("session-address",req.session.selectedAddress);
  res.redirect('/place-order')
 },
selectEditAddress : async(req,res)=>{
  let user=req.session.user;
  id = req.params.id;
  let userId = req.session.user._id;
  let selectedAddress = await user.aggregate([
    {
      $match : {_id:ObjectId(userId)}
    },
    {
      $unwind : '$address'
    },
    {
      $match : {'address.id':id}
    },
  ]).toArray();
  console.log(selectedAddress);
  let data = selectedAddress[0].address;
  let name = selectedAddress[0].address.name;
  let arr = name.split(' ');
console.log(data);
  let address = {
    fname : arr[0],
    lname : arr[1],
    street : data.street,
    state : data.state,
    town : data.town,
    zip : data.zip,
    phone: data.phone,
    email : data.email
  }
  console.log("this address = ",address);
  req.session.selectedAddress = address;
  console.log("session-address",req.session.selectedAddress);
  // res.redirect('/edit-address/'+req.params.id)
  res.render('user/edit-address',{address,id,user});
  console.log("vv",address);
 },
 updateAddress : async(req,res)=>{
  let data = req.body;
  let addressId = req.params.id;
  let userId = req.session.user._id;
  console.log("kooi",data);
  console.log("kooid",addressId);
  await user.updateMany({_id:ObjectId(userId),"address.id":addressId},
  {
    $set : {"address.$.name":data.fname+" "+data.lname,"address.$.street":data.street,"address.$.state":data.state,"address.$.town":data.town,
    "address.$.zip":data.zip,"address.$.phone":data.phone,"address.$.email":data.email}
  });
  res.redirect('/address-book');
 },
 viewAddressBook : async(req,res)=>{
  let user=req.session.user;
   let userId = req.session.user._id;
   let data = await user.findOne({_id:ObjectId(userId)});
   console.log(data);
   res.render('user/view-address-book',{data,user});
 },
 getUserInfo : async(req,res)=>{
    let user = req.session.user;
    let userId = req.session.user._id;
    let userInfo = await user.findOne({_id:ObjectId(userId)});
    // resolve(userInfo);
    res.render('user/user-profile',{user,userInfo,userId});
 },
 userInfoUpdate : async(req,res)=>{
  let userId = req.params.id;
  data = req.body;
    user.updateOne({_id:ObjectId(userId)},{$set:{name:data.name,email:data.email}}).then(()=>{
      res.redirect('/user-profile');
    });
 },
 getMyOrders : async(req,res)=>{
    // console.log("hyyy",userId);
    let user = req.session.user;
    let userId = req.session.user._id;
   let orderInfo =  await orders.find({userId:userId}).sort({date:-1}).toArray();
   console.log("orderinfo = ",orderInfo)
   res.render('user/my-orders',{orderInfo,user}); 
 },
 getOrderedProducts : async(req,res)=>{
  let user = req.session.user;
  let orderId = req.params.id;
    let orderItems = await order.aggregate([
      {
        $match : {_id:ObjectId(orderId)}
      },
      {
        $unwind : '$products'
      },
      {
        $project : {
          item : '$products.item',
          quantity : '$products.quantity'
        }
      },
      {
        $lookup : {
          from : 'products',
          localField : 'item',
          foreignField : '_id',
          as : 'productDetails'
        }
      },
      {
        $project : {
          item : 1, quantity : 1, productDetails : {$arrayElemAt:['$productDetails',0]}
        }
      }
     ]).toArray();
     console.log("hiii=",orderItems);
     res.render('user/view-ordered-products',{orderItems,user});
 },
 removeOrder : async(req,res)=>{
    let orderId = req.params.id;
    order.deleteOne({_id:ObjectId(orderId)}).then(()=>{
      res.redirect('/my-orders');
    })
},
getChangePasword : async(req,res)=>{
  let userId = req.params.id;
  errMsg = req.session.erMsg;
  res.render('user/change-password',{userId,errMsg});
  req.session.erMsg=null;
},
changePassword : async(req,res)=>{
  var response = {};
  let userId = req.params.id;
  let data = req.body;
      let userExist = await user.findOne({_id:ObjectId(userId)});
      console.log("uid = ",userId);
      console.log("userExist = ",userExist);
      if(userExist){
        console.log("Yes user exist! = ",userExist.name);
        console.log("data = ",data.password);
        console.log("base = ",userExist.password);
        bcrypt.compare(data.password,userExist.password).then(async (status)=>{
          if(status){
              console.log("status is true = ",data);
              // response.user = user;
              // response.status = true;
              // resolve(response);
              data.newPassword = await bcrypt.hash(data.newPassword,10);
              console.log("data.newPassword = ",data.newPassword);
              user.updateOne({_id:ObjectId(userId)},{$set:{password:data.newPassword}});
              // req.session.erMsg = "Password Changed";
              // window.alert("Password changed");
              res.redirect('/');
          }
           else{
          req.session.erMsg = "Invalid Password!";
          res.redirect('/change-password/'+req.params.id);
      }
      })
  }
 },
 getAddress : async(req,res)=>{
   let user=req.session.user;
   let userId = req.session.user._id;
   let data = await user.findOne({_id:ObjectId(userId)});
   console.log(data);
   res.render('user/address-book',{data,user});
 },
 getAddAddress : async(req,res)=>{
  let user = req.session.user;
  res.render('user/add-address',{user});
 },
 addAddress : async(req,res)=>{
 let user = req.session.user;
 let data = req.body;
    console.log("Datasssss",data);
    let address = {
      id : uuid.v4(),
      name : data.fname +" "+ data.lname,
      street : data.street,
      state : data.state,
      town : data.town,
      zip : data.zip,
      phone : data.phone,
      email : data.email,
    }
    user.updateOne({_id:ObjectId(data.userId)},{$push:{address:address}}).then(()=>{
      res.redirect('/address-book');
    });
 },
 removeAddress : (req,res)=>{
  let Addid = req.params.id;
  let userId = req.session.user._id;
    user.updateOne({_id:ObjectId(userId)},{$pull:{address:{id:Addid}}});
    res.redirect('/address-book');
 },
 logout : (req,res)=>{
  req.session.user = null;
  res.redirect('/');
 },
 otpVerification : async(req,res)=>{
  let data = req.body;
  let response={}
      let checkuser = await user.findOne({email:data.email})
      if(checkuser){
        if(checkuser.status) {
          otpEmail = checkuser.email
          response.otp = OTP()
          let otp = response.otp
          let mailTransporter = nodemailer.createTransport({
              service : "gmail",
              auth : {
                  user:process.env.EMAIL_ADDRESS,
                  pass:process.env.EMAIL_PASSWORD
              }
          })
          
          let details = {
              from:process.env.EMAIL_ADDRESS,
              to:otpEmail, 
              subject:"Organico",
              text: otp+" is your Organico verification code. Do not share OTP with anyone "
          }

          mailTransporter.sendMail(details,(err)=>{
              if(err){
                  console.log(err);
              }else{
                  console.log("OTP Send Successfully ");
              }
          })

          function OTP(){
              OTP = Math.random()*1000000
              OTP = Math.floor(OTP)
              return OTP
          }
          response.user = checkuser
          response.status = true
          if(response.status){
            req.session.otp=response.otp;
            req.session.otpData=req.body;
            req.session.otpUser=response.user;
            res.redirect('/otp-login')
          }
          
          // resolve(response) 
        }
        else{
          req.session.otpErr="Entered email is blocked!";
          res.redirect('/otp-login');
          req.session.otpErr = null;
        }
      }else{
        req.session.otpErr="Email not registered!";
        res.redirect('/otp-login');
        req.session.otpErr = null; 
      }

 },
 otpLogin : async(req,res)=>{
  otp=req.session.otp
  userOtp=req.body.otp
  var user=req.session.otpUser
  if(otp==userOtp){
    req.session.user=user
    req.session.otp=null
    res.redirect('/')   
  }else{
    req.session.InvalidOtp="Invalid Otp"
    res.redirect('/otp-login')
  }
 }
}
// if(response.status){
//   req.session.otp=response.otp;
//   req.session.otpData=req.body;
//   req.session.otpUser=response.user;
//   res.redirect('/otp-login')
// }else{
//   req.session.otpErr=response.err
//   res.redirect('/otp-login')
// }