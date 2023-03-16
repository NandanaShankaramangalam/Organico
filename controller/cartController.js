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
  key_id: 'rzp_test_LXOpGrtoDyeDsU',
  key_secret: 'yUO3fCWSTHYyvRv1l7nNnoGl',
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
  addToCart: async (req, res) => {

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
  },
  getCartProducts: async (req, res) => {
    let user=req.session.user;
    let userId = req.session.user._id;
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
    let total = await getTotalAmount(req.session.user._id)
    console.log("cart now =", cartItems);
    res.render('user/cart', { cartItems, total, user });
  },

  changeProductQuantity: async (req, res) => {
    let response = {};
    let userId = req.session.user._id;
    let details = req.body;
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity)
    console.log(details);
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
  },
  getPlaceOrder: async (req, res) => {
    let user=req.session.user;
    let userId = req.session.user._id;
    let total = await getTotalAmount(userId);
    selectedAddress = req.session.selectedAddress;
    console.log("hiiiiii", selectedAddress);
    res.render('user/checkout', { total, selectedAddress, user })
  },
  placeOrder: async (req,res) => {
    let userId = req.session.user._id;
    console.log("hjgg",userId);
    let order = req.body;
    let products = await getCartProducts(userId);
    total = await getTotalAmount(userId);
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
      products: products,
      totalAmount: total,
      status: status,
      orderStatus : 'order placed',
      date: orderDate
    }

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
    orders.insertOne(orderObj).then((response) => {
      cart.deleteOne({ userId: ObjectId(userId) }).then(()=>{
        let oid = response.insertedId;
        if(req.body['payment-method'] == 'COD'){
          res.json({cod:true})
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
  },
  orderPlaced: async (req, res) => {
    let user=req.session.user;
    res.render('user/order-placed',{user});
  },
 verifyPayment : async(req,res)=>{
  console.log("body",req.body);
   let details = req.body;
   let orderId = req.body['order[receipt]'];
   
   console.log("bjbj",orderId);
   var crypto = require('crypto');
   let hmac = crypto.createHmac('sha256','yUO3fCWSTHYyvRv1l7nNnoGl');
   hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
   hmac = hmac.digest('hex');
   if(hmac == details['payment[razorpay_signature]']){
    
    orders.updateOne({ _id: ObjectId(orderId) },
       {$set : { status: 'placed' }}
     )
    console.log('Payment successful');
    res.json({status : true});
   }
   else{
    res.json({status : false});
   }
 },
 
}