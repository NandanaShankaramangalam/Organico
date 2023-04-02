const userCollection = require('../model/userSchema');
const product = require('../model/productSchema');
const cart = require('../model/cartSchema');
const orders = require('../model/orderSchema');
const wishList = require('../model/wishListSchema');
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
    getHome : async(req,res,next)=>{
      try{
      let user=req.session.user;
      let cartCount = null;
      let loggedIn =  req.session.loggedIn;
      let products = await product.find().limit(8).toArray();
      console.log("homeprod",products);
      if(user){ 
        req.session.cartCount = await getCartCount(req.session.user._id);
     }
     res.render('user/home',{products,user,cartCount:req.session.cartCount,loggedIn});
     req.session.loggedIn = null;
    }
    catch(err){
      next(err)
    }
    },
    userSignup : (req,res,next)=>{
      try{
        errMsg = req.session.errMsg;
        res.render('user/user-signup',{errMsg});
        req.session.errMsg = null;
      }
      catch(err){
        next(err)
      }
    },
    insertUser : async(req,res,next)=>{
      try{
        let userInfo = req.body;
        console.log(userInfo);
            var nameRegex = /^([A-Za-z ]){5,25}$/gm;
            var emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            var passwordRegex=/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,16}/gm;
            var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            var validateEmail = await userCollection.findOne({email : userInfo.email});
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
              await userCollection.insertOne(userData).then((data)=>{
                console.log(data); 
              });
              req.session.user = req.body;
              res.redirect('/');
            }    
          }
          catch(err){
            next(err)
          }    
    },
    userLogin : async(req,res,next)=>{
      try{
        var user = req.session.user;
  if(user){
    res.redirect('/');
  }
  else{
    err = req.session.err;
    res.render('user/user-login',{err});
    req.session.err = null;
  }
}
catch(err){
  next(err)
}
    },
    userCheck : async(req,res,next)=>{
      try{
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
                  req.session.loggedIn = true;
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
          }
          catch(err){
            next(err)
          }
},
getOtpLogin : async(req,res,next)=>{
  try{
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
}
catch(err){
  next(err)
}
},
selectAddress : async(req,res,next)=>{
  try{
  id = req.params.id;
  let userId = req.session.user._id;
  let selectedAddress = await userCollection.aggregate([
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
  res.redirect('/place-order');
}
catch(err){
  next(err)
}
 },
selectEditAddress : async(req,res,next)=>{
  try{
  let user=req.session.user;
  id = req.params.id;
  let userId = req.session.user._id;
  let selectedAddress = await userCollection.aggregate([
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
}
catch(err){
  next(err)
}
 },
 updateAddress : async(req,res,next)=>{
  try{
  let data = req.body;
  let addressId = req.params.id;
  let userId = req.session.user._id;
  console.log("kooi",data);
  console.log("kooid",addressId);
  await userCollection.updateMany({_id:ObjectId(userId),"address.id":addressId},
  {
    $set : {"address.$.name":data.fname+" "+data.lname,"address.$.street":data.street,"address.$.state":data.state,"address.$.town":data.town,
    "address.$.zip":data.zip,"address.$.phone":data.phone,"address.$.email":data.email}
  });
  res.redirect('/address-book');
}
catch(err){
  next(err)
}
 },
 viewAddressBook : async(req,res,next)=>{
  try{
  let user=req.session.user;
   let userId = req.session.user._id;
   let data = await userCollection.findOne({_id:ObjectId(userId)});
   console.log(data);
   res.render('user/view-address-book',{data,user});
  }
  catch(err){
    next(err)
  }
 },
 getUserInfo : async(req,res,next)=>{
  try{
  let cartCount = req.session.cartCount;
    let user = req.session.user;
    let userId = req.session.user._id;
    let userInfo = await userCollection.findOne({_id:ObjectId(userId)});
    // resolve(userInfo);
    res.render('user/user-profile',{user,userInfo,userId,cartCount});
  }
  catch(err){
    next(err)
  }
 },
 userInfoUpdate : async(req,res,next)=>{
  try{
  let userId = req.params.id;
  data = req.body;
    userCollection.updateOne({_id:ObjectId(userId)},{$set:{name:data.name,email:data.email}}).then(()=>{
      res.redirect('/user-profile');
    });
  }
  catch(err){
    next(err)
  }
 },
 getMyOrders : async(req,res,next)=>{
  try{
    // console.log("hyyy",userId);
    let cartCount = req.session.cartCount;
    let user = req.session.user;
    let userId = req.session.user._id;
   let orderInfo =  await orders.find({userId:userId}).sort({_id:-1}).toArray();
  //  console.log("orderinfo = ",orderInfo)
   res.render('user/my-orders',{orderInfo,user,cartCount}); 
  }
  catch(err){
    next(err)
  }
 },
 getOrderedProducts : async(req,res,next)=>{
  try{
  let cartCount = req.session.cartCount;
  let user = req.session.user;
  let orderId = req.params.id;
    let orderData = await order.findOne({_id : ObjectId(orderId)});
    console.log("orderData=",orderData);
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
     res.render('user/view-ordered-products',{orderItems,user,cartCount,orderData});
    }
    catch(err){
      next(err)
    }
 },
//  removeOrder : async(req,res)=>{
//     let orderId = req.params.id;
//     order.deleteOne({_id:ObjectId(orderId)}).then(()=>{
//       res.redirect('/my-orders');
//     })
// },
getChangePasword : async(req,res,next)=>{
  try{
  let userId = req.params.id;
  errMsg = req.session.erMsg;
  res.render('user/change-password',{userId,errMsg});
  req.session.erMsg=null;
  }
  catch(err){
    next(err)
  }
},
changePassword : async(req,res,next)=>{
  try{
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
              userCollection.updateOne({_id:ObjectId(userId)},{$set:{password:data.newPassword}});
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
}
catch(err){
  next(err)
}
 },
 getAddress : async(req,res,next)=>{
  try{
   let cartCount = req.session.cartCount;
   let user=req.session.user;
   let userId = req.session.user._id;
   let data = await userCollection.findOne({_id:ObjectId(userId)});
   console.log(data);
   res.render('user/address-book',{data,user,cartCount});
  }
  catch(err){
    next(err)
  }
 },
 getAddAddress : async(req,res,next)=>{
  try{
  let user = req.session.user;
  res.render('user/add-address',{user});
  }
  catch(err){
    next(err)
  }
 },
 
 addAddress : async(req,res,next)=>{
  try{
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
    userCollection.updateOne({_id:ObjectId(data.userId)},{$push:{address:address}}).then(()=>{
      res.redirect('/address-book');
    });
  }
  catch(err){
    next(err)
  }
 },
 removeAddress : (req,res,next)=>{
  try{
  let Addid = req.params.id;
  let userId = req.session.user._id;
    userCollection.updateOne({_id:ObjectId(userId)},{$pull:{address:{id:Addid}}});
    res.redirect('/address-book');
  }
  catch(err){
    next(err)
  }
 },
 wishList : async(req,res,next)=>{
  try{
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = req.session.cartCount;
  let wishListItems = await wishList.aggregate([
    {
      $match: { userId: ObjectId(userId) }
    },
    {
      $unwind: '$products'
    },
    {
      $project: {
        item: '$products.item',
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'item',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    {
      $project: {
        item: 1, productDetails: { $arrayElemAt: ['$productDetails', 0] }
      }
    }

  ]).toArray();
  console.log("wishhh",wishListItems);
  res.render('user/wishList',{user,wishListItems,cartCount});
}
catch(err){
  next(err)
}
 },
 addToWishList : async(req,res,next)=>{
  try{
  console.log("jjjooo");
  let productId = req.params.id;
  let userId = req.session.user._id;
  let productObject = {
    item: ObjectId(productId),
  }
  console.log("prod obj",productObject);
  let userWishList = await wishList.findOne({ userId: ObjectId(userId)});
   if (userWishList) {
     let productExist = userWishList.products.findIndex(product => product.item == productId);
     if (productExist != -1) {
       res.redirect('/wishlist');
     }
     else {
       wishList.updateOne({ userId: ObjectId(userId) }, { $push: { products: productObject } }).then((response) => {
         res.redirect('/wishlist');
       })
     }
   }
   else {
     let wishListObj = {
       userId: ObjectId(userId),
       products: [productObject]
     }
     wishList.insertOne(wishListObj).then((response) => {
       res.redirect('/wishlist');
     })
   }
  }
  catch(err){
    next(err)
  }
 },
 cancelOrder : async(req,res,next)=>{
    try{
    let orderId = req.params.id;
    let userId = req.session.user._id;
    console.log("oidd",orderId);
    let data = await orders.findOne({_id:ObjectId(orderId)});
    let orderAmount = data.totalAmount[0].total;
    console.log("amttt",orderAmount);
    console.log("dataaa",data);
    console.log("methoddddd",data.paymentMethod);
    if(data.paymentMethod == 'COD'){
      order.updateOne({_id:ObjectId(orderId)},{$set:{orderStatus:'order cancelled'}});
      
    }
    else{
      order.updateOne({_id:ObjectId(orderId)},{$set:{orderStatus:'order cancelled',paymentStatus:'Return'}});
      userCollection.updateOne({ _id:ObjectId(userId) }, { $inc: { wallet: orderAmount } })
    }
    
    res.redirect('/my-orders');
  }
  catch(err){
    next(err)
  }
 },

//  Start forgot password
 getForgotPasword : async(req,res,next)=>{
  try{
  console.log("forgot");
    errMsg = req.session.otpErr;
    res.render('user/forgot-password',{errMsg});
    req.session.otpErr = null;
  }
  catch(err){
    next(err)
  }
 },
 generateOtp : async(req,res,next)=>{
  try{
  console.log("getotp");

  let data = req.body;
  console.log("otpdata",data);
  let response={}
      let checkuser = await userCollection.findOne({email:data.email})
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
                  // res.redirect('/verify-otp');
                  // res.send('gvhgvhgv');
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
            req.session.email = data.email;
            console.log("maaiil",req.session.email);
            res.redirect('/verify-otp')
          }
          
          // resolve(response) 
        }
        else{
          req.session.otpErr="Entered email is blocked!";
          res.redirect('/forgot-password');
          req.session.otpErr = null;
        }
      }else{
        req.session.otpErr="Email not registered!";
        res.redirect('/forgot-password');
        req.session.otpErr = null; 
      }
    }
    catch(err){
      next(err)
    }
 },
 verifyOtp : async(req,res,next)=>{
  try{
  // var user=req.session.user
  // if(user){
  //   res.redirect('/')
  // }else{
  otp=req.session.otp
  data=req.session.otpData
  err=req.session.otpErr
  invalid=req.session.InvalidOtp
  if(req.session.email){
    res.render('user/verify-otp',{otp,data,err,invalid});
  }
  else{
    res.redirect('/forgot-password');
  }
  req.session.otpErr=null
  req.session.otpData = null;
  // }
  //  res.render('user/verify-otp');
}
catch(err){
  next(err)
}
 },
 verifyPasswordOtp : async(req,res,next)=>{
  try{
  otp=req.session.otp
  userOtp=req.body.otp
  var user=req.session.otpUser
  console.log("otp",otp);
  console.log("userOtp",userOtp);
  if(otp==userOtp){
    req.session.otp=null
    req.session.otpVerify = true;
    res.redirect('/set-forgot-password');   
  }else{
    req.session.InvalidOtp="Incorrect OTP"
    console.log("invalid otp");
    res.redirect('/verify-otp')
  }
}
catch(err){
  next(err)
}
 },
 setForgotPassword : async(req,res,next)=>{
  try{
  if(req.session.otpVerify){
    res.render('user/set-forgot-password');
  }
   else{
    res.redirect('/forgot-password');   
   }
  }
  catch(err){
    next(err)
  }
 },
 resetNewPassword : async(req,res,next)=>{
  try{
  var response = {};
  let email = req.session.email;
  let data = req.body;
  console.log("lllll",data);
  if(data.newPassword == data.confirmNewPassword){
    console.log("settttttttt");
    data.newPassword = await bcrypt.hash(data.newPassword,10);
    userCollection.updateOne({email : email},{$set:{password:data.newPassword}});
    res.redirect('/user-login');
    req.session.email = null;
    req.session.otpVerify  = null;
  }
  else{
    console.log("not okkkkkkkkk");
    res.redirect('/set-forgot-password');
  }
  console.log("datass",data);
  // user.updateOne({email : email},{$set:{password:data.newPassword}});
      // let userExist = await user.findOne({email:email});
      // // console.log("uid = ",userId);
      // console.log("userExist = ",userExist);
      // if(userExist){
      //   console.log("Yes user exist! = ",userExist.name);
      //   console.log("data = ",data.password);
      //   console.log("base = ",userExist.password);

      //   bcrypt.compare(data.password,userExist.password).then(async (status)=>{
      //     if(status){
      //         console.log("status is true = ",data);
      //         // response.user = user;
      //         // response.status = true;
      //         // resolve(response);
      //         data.newPassword = await bcrypt.hash(data.newPassword,10);
      //         console.log("data.newPassword = ",data.newPassword);
      //         user.updateOne({email : email},{$set:{password:data.newPassword}});
      //         // req.session.erMsg = "Password Changed";
      //         // window.alert("Password changed");
      //         res.redirect('/');
      //     }
      //      else{
      //     req.session.erMsg = "Invalid Password!";
      //     res.redirect('/change-password/'+req.params.id);
      // }
      // })
  // }
}
catch(err){
  next(err)
}
 },
//  End forgot password
getContactUs: async(req,res,next)=>{
   try{
     errMsg = req.session.errMsg;
     res.render('user/contact-us',{errMsg});
   }
   catch(err){
    next(err);
   }
},
contactUs : async(req,res,next)=>{
   try{
    data = req.body;
    console.log("cntct",data);
    let emailRegex=/^(\w){3,16}@([A-Za-z]){5,8}.([A-Za-z]){2,3}$/gm;
    let nameRegex=/^([A-Za-z ]){3,20}$/gm;
    let subjectRegex=/^([A-Za-z0-9 ]){8,20}$/gm;
    let messageRegex=/^([A-Za-z0-9 ]){10,50}$/gm;
    let response={}
    // let checkuser = await userCollection.findOne({email:data.email})

    if(data){
     if(data.name == ''){
      req.session.errMsg = 'Name is required';
      res.redirect('/contact-us');
     }
     else if(nameRegex.test(data.name) == false){
      req.session.errMsg = 'Email is invalid';
      res.redirect('/contact-us');
      }
     if(data.email == ''){
      req.session.errMsg = 'Email is required';
      res.redirect('/contact-us');
     }
     else if(emailRegex.test(data.email) == false){
      req.session.errMsg = 'Email is invalid';
      res.redirect('/contact-us');
      }
     else if(data.subject == ''){
      req.session.errMsg = 'Subject is required';
      res.redirect('/contact-us');
     }
     else if(subjectRegex.test(data.subject) == false){
      req.session.errMsg = 'Subject is invalid';
      res.redirect('/contact-us');
      }
     else if(data.message == ''){
      req.session.errMsg = 'Message is required';
      res.redirect('/contact-us');
     }
     else if(messageRegex.test(data.message) == false){
      req.session.errMsg = 'Message is invalid';
      res.redirect('/contact-us');
      }
      else{
      let mailTransporter = nodemailer.createTransport({
        service : "gmail",
        auth : {
            user:process.env.EMAIL_ADDRESS,
            pass:process.env.EMAIL_PASSWORD
        }
    })

    let details = {
      from:data.email,
      to:process.env.EMAIL_ADDRESS, 
      subject:data.subject,
      text: data.message
  }

  mailTransporter.sendMail(details,(err)=>{
      if(err){
          console.log(err);
      }else{
          console.log("Contact mail sent successfully");
          response.status = true
          res.json(response);
      }
  })
}
    }
   }
   catch(err){
    next(err);
   }
},
about : async(req,res,next)=>{
  try{
   res.render('user/about');
  }
  catch(err){
    next(err)
  }
},
 logout : (req,res,next)=>{
  try{
  req.session.user = null;
  res.redirect('/');
  }
  catch(err){
    next(err)
  }
 },
 otpVerification : async(req,res,next)=>{
  try{
  let data = req.body;
  let response={}
      let checkuser = await userCollection.findOne({email:data.email})
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
    }
    catch(err){
      next(err)
    }
 },
 otpLogin : async(req,res,next)=>{
  try{
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
catch(err){
  next(err)
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