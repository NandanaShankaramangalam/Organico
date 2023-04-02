// const product = require('../model/productSchema');
// const cart = require('../model/cartSchema');
// const { default: mongoose } = require('mongoose');
// const { ObjectId } = mongoose.Types;

const userCollection = require('../model/userSchema');
const product = require('../model/productSchema');
const cart = require('../model/cartSchema');
const wishList = require('../model/wishListSchema');
const orders = require('../model/orderSchema');
var bcrypt = require('bcrypt');
var uuid = require('uuid');
const nodemailer=require('nodemailer');
const { default: mongoose } = require('mongoose');
const { response } = require('express');
const order = require('../model/orderSchema');
const category = require('../model/categorySchema');
const { logger } = require('../model/userSchema');
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
    showProducts : async(req,res,next)=>{
      try{
        let proCount = await product.countDocuments();
        let limit  = 4;
        let skip = 0;
  
        const page = req.session.page;
        if(page) skip = (page-1)*limit;


        let user=req.session.user;
        let cartCount = req.session.cartCount;
        let filterId = req.session.filterId;
        let filterMsg;
        let filter = req.session.filter;
        let sort = req.session.sort;
        let sortId = req.session.sortId;
        let categoryList = req.session.categoryList;
        let categoryId = req.session.categoryId;
        let products;
        // if(categoryId == 'all'){
        //   console.log("set to null");
        //   products = await product.find().toArray();
        //   if(products.length==0){
        //   filterMsg="No results found";
        //   }
        // }
        console.log("bbb",sortId);
        products = await product.find().limit(limit).skip(skip).toArray();
        console.log("sort ",sort);
        console.log("filter ",filter);
        console.log("category ",categoryList);
        let categories = await category.find().toArray();
        // console.log("cattt",categories);

        if(sort && filter){
            if(sortId == 'ascending' && filterId == 'less-than-100'){
              proCount = await product.countDocuments({price:{$lt:100}}).sort({price:1});
              products = await product.find({price:{$lt:100}}).sort({price:1}).limit(limit).skip(skip).toArray();
              if(products.length === 0){
              filterMsg = 'No results found!';
              }
            }
            else if(sortId == 'ascending' && filterId == 'btw-100-and-300'){
              proCount = await product.countDocuments({price:{$gt:100,$lt:300}});
              products = await product.find({price:{$gt:100,$lt:300}}).sort({price:1}).limit(limit).skip(skip).toArray();
              if(products.length === 0){
              filterMsg = 'No results found!';
              }
            }
            else if(sortId == 'ascending' && filterId == 'above-300'){
              proCount = await product.countDocuments({price:{$gt:300}});
              products = await product.find({price:{$gt:300}}).sort({price:1}).limit(limit).skip(skip).toArray();
              if(products.length === 0){
              filterMsg = 'No results found!';
              }
            }
            else if(sortId == 'ascending' && filterId == 'all'){
              products = await product.find().sort({price:1}).limit(limit).skip(skip).toArray();
              if(products.length === 0){
                filterMsg = 'No results found!';
              }
              }
              // else if(sortId == 'ascending'){
              // products = await product.find().sort({price:1}).toArray();
              // if(products.length === 0){
              //   filterMsg = 'No results found!';
              // }
              // }
         
            else if(sortId == 'descending' && filterId == 'less-than-100'){
              proCount = await product.countDocuments({price:{$lt:100}});
              products = await product.find({price:{$lt:100}}).sort({price:-1}).limit(limit).skip(skip).toArray();
              if(products.length === 0){
              filterMsg = 'No results found!';
              }
            }
            else if(sortId == 'descending' && filterId == 'btw-100-and-300'){
              proCount = await product.countDocuments({price:{$gt:100,$lt:300}});
              products = await product.find({price:{$gt:100,$lt:300}}).sort({price:-1}).limit(limit).skip(skip).toArray();
              if(products.length === 0){
              filterMsg = 'No results found!';
              }
            }
            else if(sortId == 'descending' && filterId == 'above-300'){
              proCount = await product.countDocuments({price:{$gt:300}});
              products = await product.find({price:{$gt:300}}).sort({price:-1}).limit(limit).skip(skip).toArray();
              if(products.length === 0){
              filterMsg = 'No results found!';
              }
            }
            else if(sortId == 'descending' && filterId == 'all'){
              products = await product.find().sort({price:-1}).limit(limit).skip(skip).toArray();
              if(products.length === 0){
                filterMsg = 'No results found!';
              }
              }
              // else if(sortId == 'descending'){
              // products = await product.find().sort({price:-1}).toArray();
              // if(products.length === 0){
              //   filterMsg = 'No results found!';
              // }
              // }
              // else if(sortId == 'ascending'){
              //   products = await product.find().sort({price:1}).toArray();
              //   if(products.length === 0){
              //     filterMsg = 'No results found!';
              //   }
              //   }
           
        }
// ifff enddddddddddd
        else if(sort && categoryList){
          if(sortId == 'descending'){
          proCount = await product.countDocuments({category : categoryId});
          products = await product.find({category : categoryId}).sort({price:-1}).limit(limit).skip(skip).toArray();
          if(products.length==0){
          filterMsg="No results found";
          }
        }
          else if(sortId == 'ascending'){
          proCount = await product.countDocuments({category : categoryId});
          products = await product.find({category : categoryId}).sort({price:1}).limit(limit).skip(skip).toArray();
          if(products.length==0){
          filterMsg="No results found";
          }
        }
      }
          else if(filter && categoryList){
          if(filterId == 'less-than-100'){
            proCount = await product.countDocuments({$and:[{price:{$lt:100}},{category:categoryId}]});
            products =await  product.find({$and:[{price:{$lt:100}},{category:categoryId}]}).limit(limit).skip(skip).toArray();
            if(products.length==0){
            filterMsg="No results found";
          }
        }
          else if(filterId == 'btw-100-and-300'){
            proCount = await product.countDocuments({$and:[{price:{$gt:100,$lt:300}},{category:categoryId}]});
            products = await  product.find({$and:[{price:{$gt:100,$lt:300}},{category:categoryId}]}).limit(limit).skip(skip).toArray();
            if(products.length==0){
            filterMsg="No results found";
          }
        }
         else if(filterId == 'above-300'){
            proCount = await product.countDocuments({$and:[{price:{$gt:300}},{category:categoryId}]});
            products = await  product.find({$and:[{price:{$gt:300}},{category:categoryId}]}).limit(limit).skip(skip).toArray();
            if(products.length==0){
            filterMsg="No results found";
          }
        }
          
      }
        else if(sortId == 'descending'){
              products = await product.find().sort({price:-1}).limit(limit).skip(skip).toArray();
              if(products.length === 0){
                filterMsg = 'No results found!';
              }
              }
        else if(sortId == 'ascending'){
                products = await product.find().sort({price:1}).limit(limit).skip(skip).toArray();
        
                if(products.length === 0){
                  filterMsg = 'No results found!';
                }
                }
        
        else if(filterId == 'less-than-100'){
        proCount = await product.countDocuments({price:{$lt:100}});
        products = await product.find({price:{$lt:100}}).limit(limit).skip(skip).toArray();

        if(products.length === 0){
          filterMsg = 'No results found!';
        }
        }
        else if(filterId == 'btw-100-and-300'){
       proCount = await product.countDocuments({price:{$gt:100,$lt:300}});
       products = await product.find({price:{$gt:100,$lt:300}}).limit(limit).skip(skip).toArray();
        if(products.length === 0){
          filterMsg = 'No results found!';
        }
        }
        else if(filterId == 'above-300'){
       proCount = await product.countDocuments({price:{$gt:300}});
       products = await product.find({price:{$gt:300}}).limit(limit).skip(skip).toArray();
        if(products.length === 0){
          filterMsg = 'No results found!';
        }
        }
        else if(filterId == 'all'){
        products = await product.find().limit(limit).skip(skip).toArray();
        if(products.length === 0){
          filterMsg = 'No results found!';
        }
        }
        else if(categoryList){
          // if(categoryId == 'all'){
          //   products = await product.find().toArray();
          //   if(products.length === 0){
          //   filterMsg = 'No results found!';
          //   }
          // }
          console.log("catlist",categoryList);
          console.log("catId",categoryId);
          proCount = await product.countDocuments({category:categoryId});
          products = await product.find({category:categoryId}).limit(limit).skip(skip).toArray();
          if(products.length === 0){
            filterMsg = 'No results found!';
          } 
        }
        else{
        products = await product.find().limit(limit).skip(skip).toArray();
        }
        const count = Math.ceil(proCount/limit)
        const pageArr = [] 
        for(i=0;i<count;i++){
        pageArr.push(i+1)
        }
  
      console.log("procount",proCount);
      console.log("jnn",products);
        res.render('user/shop',{products,user,cartCount,filterMsg,categories,sortId,search:true,pageArr,pageno:req.session.page});
      }
      catch(err){
        next(err)
      }
     },
    showSingleProduct : async(req,res,next)=>{
      try{
      let cartCount = req.session.cartCount;
      let user=req.session.user;
      let productId = req.params.id;
      return new Promise(async(resolve, reject) => {
        const productData = await product.findOne({_id:ObjectId(productId)});
        res.render('user/single-product',{productData,user,cartCount});
      }) 
    }
    catch(err){
      next(err)
    }
   },
   removeProduct : async(req,res,next)=>{
    try{
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
    }
    catch(err){
      next(err)
    }
   },
   removeWishListProduct : async(req,res,next)=>{
    try{
    let user=req.session.user;
    let productId = req.params.id;
    let userId = req.session.user._id;
      wishList.updateOne({userId:ObjectId(userId),'products.item':ObjectId(productId)},{
        $pull:{
          products:{item:ObjectId(productId)}
        }
      }).then(()=>{
        res.redirect('/wishlist')
      })
    }
    catch(err){
      next(err)
    }
   },
   search : async(req,res,next)=>{
    try{
    let payload = req.body.payload.trim();
    let filter = req.session.filter;
    // console.log(payload);
    let search = await product.find({name : {$regex : new RegExp(payload+'.*','i')}}).toArray();
    // Limit search results to 10
    console.log("Filter = ",filter);
    if(filter?.id == 'less-than-100'){
      search = await product.find({name : {$regex : new RegExp(payload+'.*','i')},price:{$lt:100}}).toArray();
    }
    else if(filter?.id == 'btw-100-and-300'){
      search = await product.find({name : {$regex : new RegExp(payload+'.*','i')},$and:[{price:{$gt:100,$lt:300}}]}).toArray();
    }
    else if(filter?.id == 'above-300'){
      search = await product.find({name : {$regex : new RegExp(payload+'.*','i')},price:{$gt:300}}).toArray();
    }
    search = search.slice(0, 10);
    res.send({payload : search});
  }
  catch(err){
    next(err)
  }
   },
   filter : async(req,res,next)=>{
    try{
    console.log(req.body);
    req.session.filter = req.body;
    req.session.filterId = req.body.id;
    res.json({status:true})
    }
    catch(err){
      next(err)
    }
   },
   sort : async(req,res,next)=>{
    try{
    console.log("ghv",req.body);
    req.session.sort = req.body;
    req.session.sortId = req.body.id;
    res.json({status:true})
    }
    catch(err){
      next(err)
    }
   },
   categories : async(req,res,next)=>{
    try{
    console.log("ghv",req.body);
    req.session.categoryList = req.body;
    req.session.categoryId = req.body.id;
    res.json({status:true})
    }
    catch(err){
      next(err)
    }
   },
   categoriesAll : async(req,res)=>{
    req.session.categoryList = null;
    req.session.sort = null;
    req.session.filter = null;
    console.log("cat,sort,filter null");
    res.redirect('/shop');
   },
   pagination: async(req,res,next)=>{
    try{
      req.session.page = req.params.id
      res.redirect('/shop')
    }catch(err){
      next(err)
    }
  },
}