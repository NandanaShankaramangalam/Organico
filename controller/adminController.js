const admin = require('../model/adminSchema');
const userCollection = require('../model/userSchema');
const mongoose = require('mongoose');
const product = require('../model/productSchema');
const category = require('../model/categorySchema');
const orders = require('../model/orderSchema');
const fs = require('fs');
var uuid = require('uuid');
const sharp = require('sharp');
const { ObjectId } = mongoose.Types;



module.exports = {
    adminHome : async(req,res)=>{
        let admin=req.session.admin;
        res.render('admin/admin',{admin})
    },
    adminLogin : async(req,res)=>{
        res.render('admin/admin-login');
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
    },
    adminCheck : async(req,res)=>{
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
},
getUsers : async(req,res)=>{
      let admin = req.session.admin;
      var dataList = await userCollection.find().toArray();
      res.render('admin/user-list',{admin,dataList});
} ,
deleteUsers : async(req,res)=>{
        let userId = req.params.id;
        console.log("help",ObjectId(userId));
         userCollection.deleteOne({_id:ObjectId(userId)}).then((d)=>{
            console.log(d);
            res.redirect('/admin/user-list');
         })
} ,
blockUsers : async(req,res)=>{
       let userId = req.params.id;
       userCollection.updateOne({_id:ObjectId(userId)},{$set:{status:false}});
       res.redirect('/admin/user-list');
} ,
unblockUsers : async(req,res)=>{
        let userId = req.params.id;
        userCollection.updateOne({_id:ObjectId(userId)},{$set:{status:true}});
        res.redirect('/admin/user-list');
},
showProducts : async(req,res)=>{
        errMsg = req.session.errMsg;
        var categoryData = await category.find().toArray();
        res.render('admin/add-product',{errMsg,categoryData});
        // resolve(categoryData);
},

addProducts : async(req,res)=>{
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
        }
        productData.Images = imgId;
        product.insertOne(productData).then((data) => {
          response.status = true;
          res.redirect('/admin/product-list');
        })
      }
      //  response.id=data.insertedId
      // //  resolve(response);
      // if(response.id){
      //     id=response.id
      //     let image=req.files.image
      //     image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      //     if(!err){
      //       res.redirect('/admin/product-list');
      //     } 
      //   })
      //   }
      //   else{
      //       req.session.errMsg = data;
      //       res.redirect('/admin/add-product');
      //   }
      // }
      else{
        response.err = "Minimum two images required";
        response.session.errMsg = response.err;
        res.redirect('/admin/add-product');
      }
    }
  },
 getProducts : async(req,res)=>{
        let admin = req.session.admin;
        var products = await product.find().toArray();
        res.render('admin/product-list',{products,admin});
},
deleteProducts : async(req,res)=>{
        let productId = req.params.id;
        await product.deleteOne({_id:ObjectId(productId)}).then((response)=>{
            res.redirect('/admin/product-list');
        });
        const imageUrl = `public/product-images/${productId}.jpg`;
  console.log(productId);
  fs.unlink(imageUrl,(err)=>{
    if(err){
      console.log("Cannot remove image file");
    }
    else{
      console.log("successfully removed image");
    }
  })
},
editProducts : async(req,res)=>{
        let productId = req.params.id;
        let productData = await product.findOne({_id:ObjectId(productId)});
        errMsg = req.session.errMsg;
        res.render('admin/edit-product',{productData,errMsg});
        req.session.errMsg = null;  
},
insertEditedProducts : async(req,res)=>{
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
             }}).then((data)=>{
              obj = req.files;
              if(obj){
                const count = Object.keys(obj).length;
                for(i = 0; i < count; i++){
                  imgId = Object.keys(obj)[i];
                  image = Object.values(obj)[i];
                  console.log("imagess",imgId);
                  image.mv('./public/product-images/'+imgId+'.jpeg').then((err)=>
                  {
                    if(err){
                      console.log(err);
                    }
                    else{
                      console.log("done");
                    }
                  })
                }
                res.redirect('/admin/add-product');
              }
                else{
                  res.redirect('/admin/product-list');
                }
             })
         } 
},
showCategory : async(req,res)=>{
        let admin = req.session.admin;
        errMsg = req.session.errMsg;
        let editCategoryData = req.session.editCategory;
        var categoryData = await category.find().toArray();

        res.render('admin/add-category',{categoryData,errMsg,editCategoryData,admin});
        req.session.errMsg = null;
        req.session.editCategory = null; 
        // resolve(categoryData);
},
addCategory : async(req,res)=>{
    let categoryInfo = req.body;
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
},
editCategory : async(req,res)=>{
    let categoryId = req.params.id;
    var categoryData = await category.findOne({_id:ObjectId(categoryId)});
    // resolve(categoryData);
    req.session.editCategory = categoryData;
    res.redirect('/admin/add-category');
   },
updateCategory : async(req,res)=>{
    let categoryId = req.params.id;
    let updateData = req.body;
    await category.updateOne({_id:ObjectId(categoryId)},{$set:{category:updateData.category}})
    res.redirect('/admin/add-category'); 
}, 
deleteCategory : async(req,res)=>{
    let categoryId = req.params.id;
        category.deleteOne({_id:ObjectId(categoryId)}).then((response)=>{
            res.redirect('/admin/add-category');
        })
},  
getOrderList : async(req,res)=>{
       let orderList = await  orders.find().sort({date:-1}).toArray();
       res.render('admin/order-list',{orderList,admin:req.session.admin}); 
},
getOrderDetails : async(req,res)=>{
       let orderId = req.params.id;
       let orderDetails = await orders.findOne({_id:ObjectId(orderId)});
       res.render('admin/order-details',{orderDetails,orderId});
},
updateOrderStatus : async(req,res)=>{
  console.log("reqbooddyy",req.body);
    let orderStatus = req.body.order;
    let orderId = req.body.orderId;
    console.log("ordrstats =",orderStatus);
    await orders.updateOne({_id:ObjectId(orderId)},{$set:{orderStatus:orderStatus}});
    res.redirect('/admin/order-details/'+orderId);
},
logout : async(req,res)=>{
    req.session.admin = null;
    res.redirect('/admin/admin-login');
}
}
