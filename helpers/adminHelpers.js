const admin = require('../model/adminSchema');
const user = require('../model/userSchema');
const mongoose = require('mongoose');
const product = require('../model/productSchema');
const category = require('../model/categorySchema');
const orders = require('../model/orderSchema');
const { ObjectId } = mongoose.Types;

module.exports = {
        adminCheck : (adminInfo)=>{
            console.log(adminInfo);
            var response = {};
            return new Promise(async(resolve, reject) => {
                console.log(adminInfo);
                var adminData = await admin.findOne({email:adminInfo.email});
                if(adminData){
                   if(adminInfo.password == adminData.password){
                      response.admin = adminData;
                      response.status = true;
                      resolve(response);
                   }
                   else{
                    response.msg = "Invalid Password!";
                    resolve(response);
                }
                }
                else{
                    response.msg = "Invalid Email";
                    resolve(response);
                }
            })
    },
        getUsers : ()=>{
              return new Promise(async(resolve, reject) => {
                var dataList = await user.find().toArray();
                resolve(dataList);
              })  
        } ,
        deleteUsers : (userId)=>{
            return new Promise(async(resolve, reject) => {
                console.log("help",ObjectId(userId));
                 user.deleteOne({_id:ObjectId(userId)}).then((d)=>{
                    console.log(d);
                 })

            })
        } ,
        blockUsers : (userId)=>{
             return new Promise((resolve, reject) => {
                user.updateOne({_id:ObjectId(userId)},{$set:{status:false}});
             })
        } ,
        unblockUsers : (userId)=>{
            return new Promise((resolve, reject) => {
                user.updateOne({_id:ObjectId(userId)},{$set:{status:true}});
            })
        },
        addProducts : (productInfo)=>{
           const response = {};
            console.log(productInfo);
            return new Promise((resolve, reject) => {
                var nameRegex = /^([A-Za-z0-9_ ]){3,20}$/i;
                var priceRegex =/^([0-9.]){1,}$/i;
                var paraRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
                if(productInfo.name == ''){
                    errMsg = "Name field is empty!";
                    resolve(errMsg);
                 }
                 else if(nameRegex.test(productInfo.name) != true){
                   errMsg = "Invalid name format";
                   resolve(errMsg);
                 }
                 else if(productInfo.brand == ''){
                    errMsg = "Brand field is empty!";
                    resolve(errMsg);
                 }
                 else if(nameRegex.test(productInfo.brand) != true){
                    errMsg = "Invalid brand format";
                    resolve(errMsg);
                  }
                else if(productInfo.category == ''){
                    errMsg = "Please choose category!";
                    resolve(errMsg);
                }
                else if(productInfo.price == ''){
                    errMsg = "Price field is empty!";
                    resolve(errMsg);
                 }
                else if(priceRegex.test(productInfo.price) != true){
                   errMsg = "Price should be a number";
                   resolve(errMsg);
                 }
                else if(productInfo.stock == ''){
                    errMsg = "Stock field is empty!";
                    resolve(errMsg);
                 }
                 else if(priceRegex.test(productInfo.stock) != true){
                   errMsg = "Stock should be a number";
                   resolve(errMsg);
                 }
                else if(productInfo.description == ''){
                    errMsg = "Please add description!";
                    resolve(errMsg);
                 }
                 else if(paraRegex.test(productInfo.description) != true){
                   errMsg = "Enter a valid description";

                   resolve(errMsg);
                 }
                 else{
                    productData = {
                        name : productInfo.name,
                        brand : productInfo.brand,
                        category : productInfo.category,
                        price : parseInt(productInfo.price),
                        stock :  parseInt(productInfo.stock),
                        description : productInfo.description
                    }
                     product.insertOne(productData).then((data)=>{
                        response.id=data.insertedId
                        resolve(response);
                     })
                 }
             
               
            })
        },
        getProducts : ()=>{
            return new Promise(async(resolve, reject) => {
                var products = await product.find().toArray();
                resolve(products);
            })
        },
       
        deleteProducts : (productId)=>{
            return new Promise(async(resolve, reject) => {
                await product.deleteOne({_id:ObjectId(productId)}).then((res)=>{
                    resolve(res);
                });
            })
        },
        editProducts : (productId)=>{
            return new Promise(async(resolve, reject) => {
                var productData = await product.findOne({_id:ObjectId(productId)});
                    resolve(productData);
            })
        },
        insertEditedProducts :(productId,productInfo)=>{
            const response = {};
            return new Promise((resolve, reject) => {

                var nameRegex = /^([A-Za-z0-9_ ]){3,20}$/i;
                var priceRegex =/^([0-9.]){1,}$/i;
                var paraRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
                if(productInfo.name == ''){
                    errMsg = "Name field is empty!";
                    resolve(errMsg);
                 }
                 else if(nameRegex.test(productInfo.name) != true){
                   errMsg = "Invalid name format";
                   resolve(errMsg);
                 }
                 else if(productInfo.brand == ''){
                    errMsg = "Brand field is empty!";
                    resolve(errMsg);
                 }
                 else if(nameRegex.test(productInfo.brand) != true){
                    errMsg = "Invalid brand format";
                    resolve(errMsg);
                  }
                else if(productInfo.category == ''){
                    errMsg = "Please choose category!";
                    resolve(errMsg);
                }
                else if(productInfo.price == ''){
                    errMsg = "Price field is empty!";
                    resolve(errMsg);
                 }
                else if(priceRegex.test(productInfo.price) != true){
                   errMsg = "Price should be a number";
                   resolve(errMsg);
                 }
                else if(productInfo.stock == ''){
                    errMsg = "Stock field is empty!";
                    resolve(errMsg);
                 }
                 else if(priceRegex.test(productInfo.stock) != true){
                   errMsg = "Stock should be a number";
                   resolve(errMsg);
                 }
                else if(productInfo.description == ''){
                    errMsg = "Please add description!";
                    resolve(errMsg);
                 }
                 else if(paraRegex.test(productInfo.description) != true){
                   errMsg = "Enter a valid description";
                   resolve(errMsg);
                 }
                 else{
                    // productData = {
                    //     name : productInfo.name,
                    //     brand : productInfo.brand,
                    //     category : productInfo.category,
                    //     price : parseInt(productInfo.price),
                    //     stock :  parseInt(productInfo.stock),
                    //     description : productInfo.description
                    // }
                     product.updateOne({_id:ObjectId(productId)},{$set:{
                        name : productInfo.name,
                        brand : productInfo.brand,
                        category : productInfo.category,
                        price : parseInt(productInfo.price),
                        stock : parseInt(productInfo.stock),
                        description : productInfo.description
                     }}).then((data)=>{
                        response.status = true;
                        resolve(response);
                     })
                 }
             
               
            })
            
        },

        showCategory : ()=>{
            return new Promise(async(resolve, reject) => {
                var categoryData = await category.find().toArray();
                resolve(categoryData);
                
            })
        },
        editCategory : (categoryId)=>{
            return new Promise(async(resolve, reject) => {
                // console.log(categoryId);
              var categoryData = await category.findOne({_id:ObjectId(categoryId)});
            //   console.log("adhelpdata = "+categoryData.category);
              resolve(categoryData);
            })
           },
        updateCategory : (categoryId,updateData)=>{
            return new Promise(async(resolve, reject) => {
            await category.updateOne({_id:ObjectId(categoryId)},{$set:{category:updateData.category}})
            })
        },
        addCategory : (categoryInfo)=>{
            const response = {};
            return new Promise((resolve, reject) => {
                var nameRegex = /^([A-Za-z_ ]){3,20}$/i;
                if(categoryInfo.category == ''){
                    errMsg = "Please enter a category!";
                    resolve(errMsg);
                }
                else if(nameRegex.test(categoryInfo.category) != true){
                    errMsg = "Category name invalid!";
                    resolve(errMsg);
                }
                else{
                    category.insertOne(categoryInfo).then((data)=>{
                        response.id = data.insertedId;
                        console.log(data);
                        resolve(response);
                     })
                }    
            })
        },
        deleteCategory : (categoryId)=>{
            return new Promise((resolve, reject) => {
                category.deleteOne({_id:ObjectId(categoryId)}).then((res)=>{
                    resolve(res);
                })
            })
        },
        getOrderList : ()=>{
            return new Promise(async(resolve, reject) => {
               let orderList = await  orders.find().toArray();
               resolve(orderList); 
            })
        },
        getOrderDetails : (orderId)=>{
            return new Promise(async(resolve, reject) => {
               let orderData = await orders.findOne({_id:ObjectId(orderId)});
               console.log("order = ",orderData);
               resolve(orderData);
            })
        }
       
}