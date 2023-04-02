// const cart = require('../model/cartSchema');
// const { default: mongoose } = require('mongoose');
// const { ObjectId } = mongoose.Types;
// const user = require('../model/userSchema');
// const orders = require('../model/orderSchema');
// const product = require('../model/productSchema');

const userCollection = require('../model/userSchema');
const product = require('../model/productSchema');
const cart = require('../model/cartSchema');
const orders = require('../model/orderSchema');
const coupon = require('../model/couponSchema');
var bcrypt = require('bcrypt');
var uuid = require('uuid');
const nodemailer=require('nodemailer');
const { default: mongoose } = require('mongoose');
const { response } = require('express');
const order = require('../model/orderSchema');
require('dotenv').config();
// const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Razorpay = require('razorpay');


var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

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

function getCartProducts(userId) {
  return new Promise(async (resolve, reject) => {
    let cartItems = await cart.aggregate([
      {
        $match: { userId: ObjectId(userId) }
      },
      {
        $unwind: '$products'
      },
      {
        $project: {
          item: '$products.item',
          quantity: '$products.quantity'
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
          item: 1, quantity: 1, productDetails: { $arrayElemAt: ['$productDetails', 0] }
        }
      }

    ]).toArray();

    console.log("cart now =", cartItems);
    resolve(cartItems);
  })

}

function getTotalAmount(userId) {
  return new Promise(async (resolve, reject) => {
    let cartItems = await cart.aggregate([
      {
        $match: { userId: ObjectId(userId) }
      },
      {
        $unwind: '$products'
      },
      {
        $project: {
          item: '$products.item',
          quantity: '$products.quantity'
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
          item: 1, quantity: 1, productDetails: { $arrayElemAt: ['$productDetails', 0] }
        }
      },
      {
        $group: {

          _id: null,
          total: { $sum: { $multiply: ["$quantity", '$productDetails.price'] } }
        }
      }

    ]).toArray();
    console.log("hello");
    resolve(cartItems);
  })
}

module.exports = {
  addToCart: async (req, res,next) => {
    try{
    let productId = req.params.id;
    let userId = req.session.user._id;
    let productObject = {
      item: ObjectId(productId),
      quantity: 1
    }
    let userCart = await cart.findOne({ userId: ObjectId(userId) });
    if (userCart) {
      let productExist = userCart.products.findIndex(product => product.item == productId);
      console.log(productExist);
      if (productExist != -1) {
        cart.updateOne({ user: ObjectId(userId), 'products.item': ObjectId(productId) },
          {
            $inc: { 'products.$.quantity': 1 }
          }).then(() => {
            res.redirect('/cart');
          })
      } else {
        cart.updateOne({ userId: ObjectId(userId) },
          { $push: { products: productObject } }
        ).then((response) => {
          res.redirect('/cart');
        })
      }

    }
    else {
      let cartObj = {
        userId: ObjectId(userId),
        products: [productObject]
      }
      cart.insertOne(cartObj).then((response) => {
        res.redirect('/cart');
      })
    }
  }
  catch(err){
    next(err)
  }
  },
  getCartProducts: async (req, res,next) => {
    try{
    let user=req.session.user;
    let userId = req.session.user._id;
    let errCoupon = req.session.errCoupon;
    let cartItems = await cart.aggregate([
      {
        $match: { userId: ObjectId(userId) }
      },
      {
        $unwind: '$products'
      },
      {
        $project: {
          item: '$products.item',
          quantity: '$products.quantity'
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
          item: 1, quantity: 1, productDetails: { $arrayElemAt: ['$productDetails', 0] }
        }
      }

    ]).toArray();
    let total = await getTotalAmount(req.session.user._id);
    subtotal = total;
    console.log("Subtot=",subtotal);
    console.log("cart now =", cartItems);
    if(user){ 
      req.session.cartCount = await getCartCount(req.session.user._id);
   }
    let couponList = await coupon.find().toArray();
    // console.log("clist=",couponList);
    console.log("bb", req.session.discountAmount);
     if(req.session.discountAmount){
      discountAmount = req.session.discountAmount; 
      console.log("vvvvv",total);
      total[0].total = total[0].total - req.session.discountAmount;
      console.log("tot",total[0].total);
      req.session.total =  total[0].total;
      subtotal = discountAmount +  total[0].total;
      console.log("inn", subtotal);
     }
    //  look
    res.render('user/cart', {cartItems,subtotal,total, user,cartCount:req.session.cartCount,couponList,errCoupon,discountAmount:req.session.discountAmount});
    req.session.errCoupon = null;
    req.session.discountAmount = null;
    }
    catch(err){
      next(err)
    }
  },

  changeProductQuantity: async (req, res, next) => {
    try{
    let response = {};
    let userId = req.session.user._id;
    let details = req.body;
    // console.log("hyuu",req.body);
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity)

    console.log(details);
    let stockDetails = await product.findOne({_id:ObjectId(details.product)});
    console.log("stk details",stockDetails);
    if (details.count == -1 && details.quantity == 1) {
      cart.updateOne({ _id: ObjectId(details.cart) },
        {
          $pull: { products: { item: ObjectId(details.product) } }
        }).then(async (response) => {
          res.json({ removeProduct: true });
          let total = await getTotalAmount(userId);
          console.log("tootaal = ", total);
        })
    }
    else if(details.quantity >(stockDetails.stock - 1) && details.count ==1){
        console.log("Out of stock");
        req.session.stock = 'outOfStock';
        response.stock = 'outOfStock';
        res.json(response);
    }
    else {
      cart.updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
        {
          $inc: { 'products.$.quantity': details.count }
        }).then(async (response) => {
          let total = await getTotalAmount(userId);
          response.status = true;
          response.total = total;
          res.json(response);
        })
    }
  }
  catch(err){
    next(err)
  }
  },
  getPlaceOrder: async (req, res, next) => {
    try{
    let user=req.session.user;
    let userId = req.session.user._id;
    // let total;
    total = await getTotalAmount(userId);
    console.log("sessionamt",req.session.discountAmount);
    // if(req.session.discountAmount){
    //   total[0].total = req.session.discountPrice; 
    // }
    // else{
    //   total = await getTotalAmount(userId);
    //   total[0].total = totalPrice[0].total;
    // }
    // console.log("totttaalll",total);
    if(req.session.total){
      total[0].total = req.session.total;
    }
    
    // total = req.session.total;
    selectedAddress = req.session.selectedAddress;
    let userData = await userCollection.findOne({_id:ObjectId(userId)});
    console.log("userrr",userData);
    
    res.render('user/checkout', { total, selectedAddress, user ,userData});
  }
  catch(err){
    next(err)
  }
  },
  placeOrder: async (req,res,next) => {
    try{
    let userId = req.session.user._id;
    console.log("hjgg",userId);
    let order = req.body;
    let products = await getCartProducts(userId);
    total = await getTotalAmount(userId);
    if(req.session.total){
      total[0].total = req.session.total;
    }
    
    console.log("uu",total[0].total);
    const date = new Date();
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };
    const formattedDate = date.toLocaleString('en-US', options);
    const orderDate = formattedDate;
    // console.log("sudgfsdfsfds", order);
    let status = order['payment-method'] === 'COD' ? 'placed' : 'pending';
    let paymentStatus = order['payment-method'] === 'COD' ? 'not paid' : 'paid';
    
    // let usersId = userId
    let uid=uuid.v4()
    let orderObj = {
      deliveryDetails: {
        id : uid,
        name: order.fname + " " + order.lname,
        street: order.street,
        state: order.state,
        town: order.town,
        zip: order.zip,
        phone: order.phone,
        email: order.email,
      },
      userId: userId,
      paymentMethod: order['payment-method'],
      paymentStatus : paymentStatus,
      products: products,
      totalAmount: total,
      status: status,
      orderStatus : 'order placed',
      date: orderDate,
      month : date.getMonth()+1,
    }

  //   if(order['payment-method'] == 'wallet'){
  //     status = 'placed';
  //     paymentStatus = 'paid';
  //       orders.insertOne(orderObj).then((response) => {
  //         let amount = -(parseFloat(orderObj.totalAmount));
  //       userCollection.updateOne({_id:ObjectId(userId)},{$inc:{wallet:amount}}).then()  
  //       cart.deleteOne({ userId: ObjectId(userId) }).then(()=>{
  //         let oid = response.insertedId;
  //         req.session.orderId = response.insertedId;
  //         res.json({cod:true})
  //       })
  //     })
      
  //  }

    let productCount = products.length;
    for (i = 0; i < productCount; i++) {
      let qty = -(products[i].quantity)
      let productId = products[i].item
      console.log(productId, qty);
      await product.findOne({ _id: productId });
      console.log('3')

      product.updateOne({ _id: productId }, { $inc: { stock: qty } })
      console.log('4')
    }
    if (order.save == 'true') {
      userCollection.updateOne({ _id: ObjectId(userId) }, { $push: { address: orderObj.deliveryDetails } });

    }
    console.log(orderObj);
    orders.insertOne(orderObj).then((response) => {
      cart.deleteOne({ userId: ObjectId(userId) }).then(()=>{
        // let oid = response.insertedId;
        let oid = response.insertedId;
        req.session.orderId = response.insertedId;
        if(req.body['payment-method'] == 'COD'){
          res.json({cod:true});
        }
        else if(req.body['payment-method'] == 'wallet'){
          console.log("frrrr",orderObj.totalAmount[0].total);
          let amount = -(parseFloat(orderObj.totalAmount[0].total));
          userCollection.updateOne({_id:ObjectId(userId)},{$inc:{wallet:amount}});
          res.json({cod:true});
        }
        else{
          console.log("here total ",total);
          let totalAmt= total[0].total
           
          var options = {
            amount: totalAmt*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: ""+oid
          };
          instance.orders.create(options, function(err, order) {
            if(err){
              console.log(err);
            }
            else{
               console.log("New order",order);
               res.json(order);
            }
           
          });
          
        }
        
      })
      
      //  resolve();
      // res.json({status : true});
    })
  }
  catch(err){
    next(err)
  }
  },
  orderPlaced: async (req, res, next) => {
    try{
    let user=req.session.user;
    let orderId = req.session.orderId;
    console.log("oiddd",orderId);
    if(req.session.orderId){
       res.render('user/order-placed',{user,orderId,cartCount:req.session.cartCount});
    }
  }
  catch(err){
    next(err)
  }
  },
 verifyPayment : async(req,res,next)=>{
  try{
  console.log("body",req.body);
   let details = req.body;
   let orderId = req.body['order[receipt]'];
   
   console.log("bjbj",orderId);
   var crypto = require('crypto');
   let hmac = crypto.createHmac('sha256',process.env.RAZORPAY_SECRET_KEY);
   hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
   hmac = hmac.digest('hex');
   if(hmac == details['payment[razorpay_signature]']){
    
    orders.updateOne({ _id: ObjectId(orderId) },
       {$set : { status: 'placed' }}
     )
    console.log('Payment successful');
    // First payment
    

    res.json({status : true});
   }
   else{
    res.json({status : false});
   }
  }
  catch(err){
    next(err)
  }
 },
 applyCoupon : async(req,res,next)=>{
  try{
  let response = {};
  let couponCode = req.body.couponCode;
  let total = await getTotalAmount(req.session.user._id);
  let discountAmount;
  let cartCount = req.session.cartCount;
  console.log("cccddd",couponCode);
  console.log("cccddd",total);
  // let cartData = await cart.find({userId:req.session.user._id}).toArray();
  let couponData = await coupon.findOne({coupon:couponCode});
  console.log("insideee",total[0].total,cartCount);
  if(couponData?.discountType == "percentage"){
    if(total[0].total >= couponData.minAmount && cartCount >= couponData.minItems){
      console.log("inside",total[0].total,cartCount);
      discountAmount = (total[0].total * couponData.discount)/100;
    }
  }
  else if(total[0].total >= couponData.minAmount && cartCount >= couponData.minItems){
    console.log("outside",total[0].total,cartCount);
    discountAmount = couponData.discount;
  }
  else{
    console.log("inout");
    discountAmount = 0;
  }
  console.log("disss",discountAmount);
  req.session.discountAmount = discountAmount;
  console.log("cc", req.session.discountAmount);
  console.log("ddddddd",couponData);
  console.log("ccountt",cartCount);
  if(total[0].total <= couponData.minAmount && cartCount <= couponData.minItems){
    req.session.errCoupon = 'Not eligible for this coupon!';
    console.log("mm",req.session.errCoupon);
  }
  console.log("errcoupon",req.session.coupon);
  res.json(response);
}
catch(err){
  next(err)
}
},
invoice : async(req,res,next)=>{
  try{
  let orderId = req.session.orderId;
  console.log("huhuhuhuhhuhu",orderId);
  let orderData = await orders.findOne({_id:ObjectId(orderId)});
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
  console.log("orderData = ",orderData);
  console.log("orderItemsss = ",orderItems);
  res.render('user/invoice',{orderData,orderItems});
  }
  catch(err){
    next(err)
  }
},
 
}
