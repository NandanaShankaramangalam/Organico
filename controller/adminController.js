const admin = require('../model/adminSchema');
const userCollection = require('../model/userSchema');
const mongoose = require('mongoose');
const product = require('../model/productSchema');
const category = require('../model/categorySchema');
const coupon = require('../model/couponSchema');
const orders = require('../model/orderSchema');
const fs = require('fs');
var uuid = require('uuid');
const sharp = require('sharp');
const order = require('../model/orderSchema');
const { ObjectId } = mongoose.Types;



module.exports = {
    adminHome : async(req,res,next)=>{
      try{
        let admin=req.session.admin;
        let userCount = await userCollection.countDocuments();
        let orderCount = await orders.countDocuments();
        let revenue = await orders.aggregate([
          {
            $match: { paymentStatus: 'paid' } 
          },
          {
            $unwind : '$totalAmount'
          },
          {
            $group : {_id:null,revenue:{$sum:'$totalAmount.total'}}
          }
        ]).toArray();
        let cancelledOrders = await orders.find({orderStatus : "order-cancelled"}).toArray();
        let cancelledOrdersCount = cancelledOrders.length;
        let productsCount = await product.countDocuments();
        // console.log("hiu",cancelledOrders);
        // console.log("hiuyy",cancelledOrdersCount);
        // console.log("revenue",revenue[0].revenue);
        res.render('admin/admin',{admin,userCount,orderCount,revenue:revenue[0].revenue,cancelledOrdersCount,productsCount});
      }
      catch(err){
        next(err)
    }
    },
    adminLogin : async(req,res,next)=>{
  // res.render('admin/admin-login');
  try{
  let admin=req.session.admin;
  if(admin){
    res.redirect('/admin/');
  }
  else{
    err = req.session.err;
    console.log(err);
    res.render('admin/admin-login',{err});
    req.session.err = null;
  } 
}
  catch(err){
    next(err)
  }
    },
    adminCheck : async(req,res,next)=>{
      try{
        const adminInfo = {
            email : req.body.email,
            password : req.body.password,
          }
        console.log("info",adminInfo);
        var response = {};
            console.log(adminInfo);
            var adminData = await admin.findOne({email:adminInfo.email});
            if(adminData){
                console.log("admindata",adminData);
               if(adminInfo.password == adminData.password){
                  response.admin = adminData;
                  response.status = true;
                  console.log("Login Successfull");
                  req.session.admin = response.admin; 
                  res.redirect('/admin');
               }
               else{
                // response.msg = "Invalid Password!";
                req.session.err = "Invalid Password!";
                console.log(req.session.err); 
                // req.session.err = response.msg;
                res.redirect('/admin/admin-login');
            }
            }
            else{
                // response.msg = "Invalid Email";
                req.session.err = "Invalid Email";
                res.redirect('/admin/admin-login');
                // resolve(response);
            }
          }
          catch(err){
            next(err)
        }
},
chartData : async(req,res,next)=>{
      try{
        console.log("call success");
        let monthWise = await orders.aggregate([ 
          {
            $match:{paymentStatus:'paid'}
          },
          {
            $unwind : '$totalAmount'
          },
          {
            $group : {_id:"$month",revenue:{$sum:'$totalAmount.total'}}
          },
          {
            $sort : {_id:1}
          }
        ]).toArray();
        console.log("Monthwise",monthWise);
        res.json(monthWise);
      }
      catch(err){
        next(err)
      }
},
dashboard : async(req,res,next)=>{
  try{
      res.render('admin/dashboard');
  }
  catch(err){
    next(err)
}
},
getUsers : async(req,res,next)=>{
  try{
      let admin = req.session.admin;
      var dataList = await userCollection.find().toArray();
      res.render('admin/user-list',{admin,dataList});
  }
  catch(err){
    next(err)
}
} ,
deleteUsers : async(req,res,next)=>{
  try{
        let userId = req.params.id;
        console.log("help",ObjectId(userId));
         userCollection.deleteOne({_id:ObjectId(userId)}).then((d)=>{
            console.log(d);
            res.redirect('/admin/user-list');
         })
        }
  catch(err){
    next(err)
      }
} ,
blockUsers : async(req,res,next)=>{
  try{
       let userId = req.params.id;
       userCollection.updateOne({_id:ObjectId(userId)},{$set:{status:false}});
       res.redirect('/admin/user-list');
  }
  catch(err){
    next(err)
  }
} ,
unblockUsers : async(req,res,next)=>{
  try{
        let userId = req.params.id;
        userCollection.updateOne({_id:ObjectId(userId)},{$set:{status:true}});
        res.redirect('/admin/user-list');
  }
  catch(err){
    next(err)
}
},
showProducts : async(req,res,next)=>{
  try{
        errMsg = req.session.errMsg;
        var categoryData = await category.find().toArray();
        res.render('admin/add-product',{errMsg,categoryData});
        // resolve(categoryData);
  }
  catch(err){
    next(err)
}
},

addProducts : async(req,res,next)=>{
  try{
    let productInfo = req.body;
    let Images = req.files.image;
    const response = {};
    var nameRegex = /^([A-Za-z0-9_ ]){3,20}$/i;
    var priceRegex = /^([0-9.]){1,}$/i;
    var paraRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
    if (productInfo.name == '') {
      req.session.errMsg = "Name field is empty!";
      res.redirect('/admin/add-product');
    }
    else if (nameRegex.test(productInfo.name) != true) {
      req.session.errMsg = "Invalid name format";
      res.redirect('/admin/add-product');
    }
    else if (productInfo.brand == '') {
      req.session.errMsg = "Brand field is empty!";
      res.redirect('/admin/add-product');
    }
    else if (nameRegex.test(productInfo.brand) != true) {
      req.session.errMsg = "Invalid brand format";
      res.redirect('/admin/add-product');
    }
    else if (productInfo.category == '') {
      req.session.errMsg = "Please choose category!";
      res.redirect('/admin/add-product');
    }
    else if (productInfo.price == '') {
      req.session.errMsg = "Price field is empty!";
      res.redirect('/admin/add-product');
    }
    else if (priceRegex.test(productInfo.price) != true) {
      req.session.errMsg = "Price should be a number";
      res.redirect('/admin/add-product');
    }
    else if (productInfo.stock == '') {
      req.session.errMsg = "Stock field is empty!";
      res.redirect('/admin/add-product');
    }
    else if (priceRegex.test(productInfo.stock) != true) {
      req.session.errMsg = "Stock should be a number";
      res.redirect('/admin/add-product');
    }
    else if (productInfo.description == '') {
      req.session.errMsg = "Please add description!";
      res.redirect('/admin/add-product');
    }
    else if (paraRegex.test(productInfo.description) != true) {
      req.session.errMsg = "Enter a valid description";
      res.redirect('/admin/add-product');
    }
    else if(Images.length < 1){
      req.session.errMsg = "Select atleast 1 image!";
      res.redirect('/admin/add-product');
    }
    else if(Images.length > 3){
      req.session.errMsg = "Maximum 3 images permitted!";
      res.redirect('/admin/add-product');
    }
    else { 
      let count = Images.length;
      console.log(count);
      let imgId = [];
      if (count) {
        for (i = 0; i < count; i++) {
          imgId[i] = uuid.v4();
          console.log(Images);
          let path = Images[i].tempFilePath
          console.log(path);
          await sharp(path)
            .rotate()
            .resize(1000, 800)
            .jpeg({ mozjpeg: true })
            .toFile(`./public/product-images/${imgId[i]}.jpg`)
        }
        //  }
        productData = {
          name: productInfo.name,
          brand: productInfo.brand,
          category: productInfo.category,
          price: parseInt(productInfo.price),
          stock: parseInt(productInfo.stock),
          description: productInfo.description,
          status : true
        }
        productData.Images = imgId;
        product.insertOne(productData).then((data) => {
          response.status = true;
          res.redirect('/admin/product-list');
        })
      }
      else{
        response.err = "Minimum two images required";
        response.session.errMsg = response.err;
        res.redirect('/admin/add-product');
      }
    }
  }
  catch(err){
    next(err)
  }
  },
 getProducts : async(req,res,next)=>{
  try{
        let admin = req.session.admin;
        var products = await product.find().toArray();
        res.render('admin/product-list',{products,admin});
  }
  catch(err){
    next(err)
  }
},
deleteProducts : async(req,res,next)=>{
  try{
        let productId = req.params.id;
        await product.updateOne({_id:ObjectId(productId)},{$set:{status:false}}).then((response)=>{
            res.redirect('/admin/product-list');
        });
        // const imageUrl = `public/product-images/${productId}.jpg`;
  console.log(productId);
  // fs.unlink(imageUrl,(err)=>{
  //   if(err){
  //     console.log("Cannot remove image file");
  //   }
  //   else{
  //     console.log("successfully removed image");
  //   }
  // })
}
catch(err){
  next(err)
}
},
listProducts : async(req,res,next)=>{
  try{
    let productId = req.params.id;
    await product.updateOne({_id:ObjectId(productId)},{$set:{status:true}}).then((response)=>{
        res.redirect('/admin/product-list');
    });
  }
  catch(err){
    next(err)
  }
},
editProducts : async(req,res,next)=>{
  try{
        let productId = req.params.id;
        let productData = await product.findOne({_id:ObjectId(productId)});
        let categoryData = await category.find().toArray();
        console.log("catttdata",categoryData);
        errMsg = req.session.errMsg;
        res.render('admin/edit-product',{productData,errMsg,categoryData});
        req.session.errMsg = null;  
  }
  catch(err){
    next(err)
}
},
insertEditedProducts : async(req,res,next)=>{
  try{
    let productId = req.params.id;
    let productInfo = req.body;
    const response = {};
        var nameRegex = /^([A-Za-z0-9_ ]){3,20}$/i;
        var priceRegex =/^([0-9.]){1,}$/i;
        var paraRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
        if(productInfo.name == ''){
            req.session.errMsg = "Name field is empty!";
            res.redirect('/admin/edit-product/'+productId);
         }
         else if(nameRegex.test(productInfo.name) != true){
           req.session.errMsg = "Invalid name format";
           res.redirect('/admin/edit-product/'+productId);
         }
         else if(productInfo.brand == ''){
            req.session.errMsg = "Brand field is empty!";
            res.redirect('/admin/edit-product/'+productId);
         }
         else if(nameRegex.test(productInfo.brand) != true){
            req.session.errMsg = "Invalid brand format";
            res.redirect('/admin/edit-product/'+productId);
          }
        else if(productInfo.category == ''){
            req.session.errMsg = "Please choose category!";
            res.redirect('/admin/edit-product/'+productId);
        }
        else if(productInfo.price == ''){
            req.session.errMsg = "Price field is empty!";
            res.redirect('/admin/edit-product/'+productId);
         }
        else if(priceRegex.test(productInfo.price) != true){
           req.session.errMsg = "Price should be a number";
           res.redirect('/admin/edit-product/'+productId);
         }
        else if(productInfo.stock == ''){
            req.session.errMsg = "Stock field is empty!";
            res.redirect('/admin/edit-product/'+productId);
         }
         else if(priceRegex.test(productInfo.stock) != true){
           req.session.errMsg = "Stock should be a number";
           res.redirect('/admin/edit-product/'+productId);
         }
        else if(productInfo.description == ''){
            req.session.errMsg = "Please add description!";
            res.redirect('/admin/edit-product/'+productId);
         }
         else if(paraRegex.test(productInfo.description) != true){
           req.session.errMsg = "Enter a valid description";
           res.redirect('/admin/edit-product/'+productId);
         }
         else{

             product.updateOne({_id:ObjectId(productId)},{$set:{
                name : productInfo.name,
                brand : productInfo.brand,
                category : productInfo.category,
                price : parseInt(productInfo.price),
                stock : parseInt(productInfo.stock),
                description : productInfo.description
             }}).then(async(data)=>{
              obj = req.files;
              if(obj){
                const count = Object.keys(obj).length;
                for(i = 0; i < count; i++){
                  imgId = Object.keys(obj)[i];
                  image = Object.values(obj)[i];
                  console.log("imagess",image);
                  let path = image.tempFilePath
                  console.log(path);
                  await sharp(path)
                .rotate()
                .resize(1000, 800)
                .jpeg({ mozjpeg: true })
                .toFile(`./public/product-images/${imgId}.jpg`)
                  // image.mv('./public/product-images/'+imgId+'.jpg').then((err)=>
                  // {
                  //   if(err){
                  //     console.log(err);
                  //   }
                  //   else{
                  //     console.log("done");
                  //   }
                  // })
                } 
                res.redirect('/admin/product-list');
              }
                else{
                  res.redirect('/admin/product-list');
                }
             })
        }
      }
      catch(err){
        next(err)
    }
},
showCategory : async(req,res,next)=>{
  try{
        let admin = req.session.admin;
        errMsg = req.session.errMsg;
        let editCategoryData = req.session.editCategory;
        var categoryData = await category.find().toArray();

        res.render('admin/add-category',{categoryData,errMsg,editCategoryData,admin});
        req.session.errMsg = null;
        req.session.editCategory = null; 
        // resolve(categoryData);
  }
  catch(err){
    next(err)
  }
},
addCategory : async(req,res,next)=>{
  try{
    let categoryInfo = req.body;
    categoryInfo.status = true;
    console.log("CategoryInfo",categoryInfo);
    const response = {};
        var nameRegex = /^([A-Za-z_ ]){3,20}$/i;
        if(categoryInfo.category == ''){
            errMsg = "Please enter a category!";
            res.redirect('/admin/add-category');
        }
        else if(nameRegex.test(categoryInfo.category) != true){
            errMsg = "Category name invalid!";
            res.redirect('/admin/add-category');
        }
        else{
            category.insertOne(categoryInfo).then((data)=>{
                response.id = data.insertedId;
                console.log(data);
                // resolve(response);
                if(response.id){
                    res.redirect('/admin/add-category');
                  }
                  else{
                    req.session.errMsg = data;
                    res.redirect('/admin/add-category');
                  }
             })
        }  
      }
      catch(err){
        next(err)
      }  
},
editCategory : async(req,res,next)=>{
  try{
    let categoryId = req.params.id;
    var categoryData = await category.findOne({_id:ObjectId(categoryId)});
    // resolve(categoryData);
    req.session.editCategory = categoryData;
    res.redirect('/admin/add-category');
  }
  catch(err){
    next(err)
  }
   },
updateCategory : async(req,res,next)=>{
    try{
    let categoryId = req.params.id;
    let updateData = req.body;
    await category.updateOne({_id:ObjectId(categoryId)},{$set:{category:updateData.category}})
    res.redirect('/admin/add-category'); 
    }
    catch(err){
      next(err)
    }
}, 
deleteCategory : async(req,res,next)=>{
  try{
    let categoryId = req.params.id;
    console.log("catidd",categoryId);
        let categoryData = await category.findOne({_id:ObjectId(categoryId)});
        console.log("mmm",categoryData);
        let categoryName = categoryData.category;
        console.log("kkk",categoryName);
        category.updateOne({_id:ObjectId(categoryId)},{$set:{status:false}}).then((response)=>{
          product.updateMany({category:categoryName},{$set:{status:false}});
            res.redirect('/admin/add-category');
        })
      }
  catch(err){
    next(err)
  }
},  
listCategory : async(req,res,next)=>{
  try{
    let categoryId = req.params.id;
    let categoryData = await category.findOne({_id:ObjectId(categoryId)});
        let categoryName = categoryData.category;
        console.log("ggg",categoryName);
        category.updateOne({_id:ObjectId(categoryId)},{$set:{status:true}}).then((response)=>{
          product.updateMany({category:categoryName},{$set:{status:true}});
            res.redirect('/admin/add-category');
        })
      }
  catch(err){
    next(err)
  }
},  
getOrderList : async(req,res,next)=>{
  try{
       let orderList = await  orders.find().sort({_id:-1}).toArray();
       res.render('admin/order-list',{orderList,admin:req.session.admin}); 
  }
  catch(err){
    next(err)
  }
},
getOrderDetails : async(req,res,next)=>{
      try{
       let orderId = req.params.id;
       let orderDetails = await orders.findOne({_id:ObjectId(orderId)});
       res.render('admin/order-details',{orderDetails,orderId});
      }
      catch(err){
        next(err)
      }
},
updateOrderStatus : async(req,res,next)=>{
  try{
  console.log("reqbooddyy",req.body);
    let orderStatus = req.body.order;
    // let userId = req.session.user._id;
    let orderId = req.body.orderId;
    // let userId = req.session.user._id;
    // let orderAmount = await orders.findOne({ userId: userId });
    console.log("ordrstats =",orderStatus);
      await orders.updateOne({_id:ObjectId(orderId)},{$set:{orderStatus:orderStatus}});
    // if(orderStatus == 'order-cancelled'){
    //   await orders.updateOne({_id:ObjectId(orderId)},{$set:{paymentStatus:'Return'}});
    //   userCollection.updateOne({ _id:ObjectId(userId) }, { $inc: { wallet: orderAmount } });
    // }
    res.redirect('/admin/order-details/'+orderId);
  }
  catch(err){
    next(err)
  }
},
getCoupon : (req,res,next)=>{
  try{
  let admin = req.session.admin;
    res.render('admin/coupon',{admin});
  }
  catch(err){
    next(err)
  }
},
addCoupon : (req,res,next)=>{
  try{
    let couponData = req.body;
    console.log("cdata",couponData);
    let couponInfo = {
       coupon : couponData.coupon,
       expiryDate : couponData.expiryDate,
       minItems : parseInt(couponData.minItems),
       minAmount : parseInt(couponData.minAmount),
       discountType : couponData.discountType,
       discount : parseInt(couponData.discount)
    }
    coupon.insertOne(couponInfo).then((data)=>{
        // console.log(data);
    })
    res.redirect('/admin/coupon-list');
  }
  catch(err){
    next(err)
}
},
getCouponList : async(req,res,next)=>{
  try{
    let couponList = await coupon.find().toArray();
    // console.log("list",couponList);
    res.render('admin/coupon-list',{couponList});
  }
  catch(err){
    next(err)
  }
},
getEditCoupon : async(req,res,next)=>{
  try{
    let couponId = req.params.id;
    let couponData = await coupon.findOne({_id:ObjectId(couponId)});
    // console.log("foo",couponData);
    res.render('admin/edit-coupon',{couponData});
  }
  catch(err){
    next(err)
  }
},
updateCoupon : (req,res,next)=>{
  try{
    let couponId = req.params.id;
    let couponData = req.body;
    coupon.updateMany({_id:ObjectId(couponId)},
    {
      $set: {
          coupon : couponData.coupon,
          expiryDate : couponData.expiryDate,
          minItems : couponData.minItems,
          minAmount : couponData.minAmount,
          discountType : couponData.discountType,
          discount : couponData.discount
      }
    });
    res.redirect('/admin/coupon-list');
  }
  catch(err){
    next(err)
  }
},
removeCoupon : async(req,res,next)=>{
  try{
    let couponId = req.params.id;
    console.log("cid",couponId);
    coupon.deleteOne({_id:ObjectId(couponId)});
    res.redirect('/admin/coupon-list');
  }
  catch(err){
    next(err)
  }
},
banner : async(req,res,next)=>{
  try{
    res.render('admin/banner');
  }
  catch(err){
    next(err)
  }
},
uploadBanner : async(req,res,next)=>{
  try{
  console.log("imgfile",req.files);
  if(req.files?.bannerImage){
    let path = req.files.bannerImage.tempFilePath;
    console.log("imgpath",path);
    await sharp(path)
    .rotate()
    .resize(2000, 1333)
    .jpeg({ mozjpeg: true })
    .toFile(`./public/banner-images/banner.jpg`)
  }
  if(req.files?.bannerImage2){
    let path = req.files.bannerImage2.tempFilePath;
    console.log("imgpath",path);
    await sharp(path)
    .rotate()
    .resize(2000, 1333)
    .jpeg({ mozjpeg: true })
    .toFile(`./public/banner-images/banner2.jpg`)
  }
  res.redirect('/admin/banner');
}
catch(err){
  next(err)
}
},
getSalesReport : async(req,res,next)=>{
  try{
    let report = await orders.find({paymentStatus:'paid'}).sort({date:-1}).toArray();
    console.log("ghvhgv",report);
    res.render('admin/sales-report',{report});
  }
  catch(err){
    next(err)
  }
},
logout : async(req,res,next)=>{
  try{
    req.session.admin = null;
    res.redirect('/admin/admin-login');
  }
  catch(err){
    next(err)
  }
}
}
