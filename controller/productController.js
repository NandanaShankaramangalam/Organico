// const product = require('../model/productSchema');
// const cart = require('../model/cartSchema');
// const { default: mongoose } = require('mongoose');
// const { ObjectId } = mongoose.Types;

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

function getTotalAmount(userId){
  return new Promise(async(resolve, reject) => {
    let cartItems = await cart.aggregate([
      {
        $match : {userId:ObjectId(userId)}
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
      },
      {
       $group : {

         _id : null,
         total : {$sum : {$multiply:["$quantity",'$productDetails.price']}}
       }
      }
      
     ]).toArray();
     console.log("hello");
     resolve(cartItems);
  })
}

module.exports = {
    showProducts : async(req,res)=>{
        let user=req.session.user;
        let cartCount = req.session.cartCount;
        let filterId = req.session.filterId;
        let filterMsg;
        if(filterId == 'less-than-100'){
        const products = await product.find({price:{$lt:100}}).toArray();
        if(products.length === 0){
          filterMsg = 'No results found!';
        }
        res.render('user/shop',{products,filterMsg,user});
        }
        else if(filterId == 'btw-100-and-300'){
        const products = await product.find({price:{$gt:100,$lt:300}}).toArray();
        if(products.length === 0){
          filterMsg = 'No results found!';
          }
        res.render('user/shop',{products,filterMsg});
        }
        else if(filterId == 'above-300'){
        const products = await product.find({price:{$gt:300}}).toArray();
        if(products.length === 0){
          filterMsg = 'No results found!';
          }
        res.render('user/shop',{products,filterMsg});
        }
        else if(filterId == 'all'){
          const products = await product.find().toArray();
          res.render('user/shop',{products});
        }
        else{
        const products = await product.find().toArray();
        res.render('user/shop',{products,user,cartCount});
        }
      
     },
    showSingleProduct : async(req,res)=>{
      let user=req.session.user;
      let productId = req.params.id;
      return new Promise(async(resolve, reject) => {
        const productData = await product.findOne({_id:ObjectId(productId)});
        res.render('user/single-product',{productData,user});
      }) 
   },
   removeProduct : async(req,res)=>{
    let user=req.session.user;
    let productId = req.params.id;
    let userId = req.session.user._id;
      cart.updateOne({userId:ObjectId(userId),'products.item':ObjectId(productId)},{
        $pull:{
          products:{item:ObjectId(productId)}
        }
      }).then(()=>{
        res.redirect('/cart')
      })

   },
   search : async(req,res)=>{
    let payload = req.body.payload.trim();
    // console.log(payload);
    let search = await product.find({name : {$regex : new RegExp(payload+'.*','i')}}).toArray();
    // Limit search results to 10
    search = search.slice(0, 10);
    res.send({payload : search});
   },
   filter : async(req,res)=>{
    console.log(req.body);
    req.session.filterId = req.body.id;
    res.json({status:true})
   }
}