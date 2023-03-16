var express = require('express');
var router = express.Router();
const adminHelpers=require('../helpers/adminHelpers');
const fs = require('fs');
const { showCategory } = require('../helpers/adminHelpers');
var nocache = require('nocache');
const userHelpers = require('../helpers/userHelpers');
<<<<<<< HEAD
const adminController = require('../controller/adminController');
=======
>>>>>>> 44fc99901b655be9570cb355c355657cdc30e2cf


/* GET users listing. */

verifyLogin=(req,res,next)=>{
  let admin=req.session.admin
  if(admin){
    next()
  }else{
    res.redirect('/admin/admin-login')
  }
}

router.get('/',verifyLogin,adminController.adminHome);

router.get('/admin-login',nocache(),adminController.adminLogin);
router.post('/admin-login',nocache(),adminController.adminCheck);

router.get('/user-list',verifyLogin,adminController.getUsers);

router.get('/delete-user/:id',verifyLogin,adminController.deleteUsers);

router.get('/block-user/:id',verifyLogin,adminController.blockUsers);

router.get('/unblock-user/:id',verifyLogin,adminController.unblockUsers);

router.get('/add-product',verifyLogin,adminController.showProducts);

<<<<<<< HEAD
router.post('/add-product',adminController.addProducts);

router.get('/product-list',verifyLogin,adminController.getProducts);

router.get('/delete-product/:id',verifyLogin,adminController.deleteProducts)
=======
router.get('/add-product',verifyLogin,(req,res)=>{
 
  errMsg = req.session.errMsg;
  adminHelpers.showCategory().then((show)=>{
    res.render('admin/add-product',{errMsg,show});
  })
  
  req.session.errMsg = null;
})

router.post('/add-product',(req,res)=>{
  
  adminHelpers.addProducts(req.body).then((data)=>{
    if(data.id){
      id=data.id
      let image=req.files.image
      image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.redirect('/admin/product-list');
      } 
    })
    }
    else{
        req.session.errMsg = data;
        res.redirect('/admin/add-product');
    }
  })
})

router.get('/product-list',verifyLogin,(req,res)=>{
  admin = req.session.admin;
  if(admin){
    adminHelpers.getProducts().then((products)=>{
      res.render('admin/product-list',{products,admin});
    })
  }
  else{
    res.redirect('/admin/admin-login');
  }
})
>>>>>>> 44fc99901b655be9570cb355c355657cdc30e2cf

router.get('/edit-product/:id',verifyLogin,adminController.editProducts);

router.post('/edit-product/:id',verifyLogin,adminController.insertEditedProducts);

router.get('/add-category',verifyLogin,adminController.showCategory);

router.post('/add-category',verifyLogin,adminController.addCategory)

<<<<<<< HEAD
router.get('/edit-category/:id',verifyLogin,adminController.editCategory);
router.post('/edit-category/:id',verifyLogin,adminController.updateCategory);

router.get('/delete-category/:id',verifyLogin,adminController.deleteCategory)
=======
  
  adminHelpers.insertEditedProducts(productId,productData).then((data)=>{
   
    if(data.status){    
      
       if(req.files){
        let image=req.files.image 
        image.mv('./public/product-images/'+productId+'.jpg',(err)=>{
          console.log(err);
        })
       }
       res.redirect('/admin/product-list');
    }
    else{ 
      req.session.errMsg = data;
      res.redirect('/admin/edit-product/'+productId);
    }
  });
   
})

router.get('/add-category',verifyLogin,(req,res)=>{
  let admin = req.session.admin;
  errMsg = req.session.errMsg;
  editCategoryData = req.session.editCategory;
  console.log(editCategoryData);
  adminHelpers.showCategory().then((categoryData)=>{
    // console.log(categoryData);
  res.render('admin/add-category',{categoryData,errMsg,editCategoryData,admin});
  req.session.errMsg = null;
  req.session.editCategory = null; 
  })
 
})
>>>>>>> 44fc99901b655be9570cb355c355657cdc30e2cf

router.get('/order-list',verifyLogin,adminController.getOrderList);

router.get('/order-details/:id',verifyLogin,adminController.getOrderDetails);
router.post('/order-details/:id',adminController.updateOrderStatus)

// router.post('/update-order-status',adminController.updateOrderStatus);

router.get('/logout',verifyLogin,adminController.logout);

<<<<<<< HEAD
=======
})

router.get('/order-list',verifyLogin,async(req,res)=>{
  let orderList = await adminHelpers.getOrderList();
  console.log("orderList = ",orderList);
  res.render('admin/order-list',{orderList,admin:req.session.admin}); 
})

router.get('/order-details/:id',verifyLogin,async(req,res)=>{
  let orderDetails = await adminHelpers.getOrderDetails(req.params.id);
  res.render('admin/order-details',{orderDetails});
})

router.get('/logout',verifyLogin,(req,res)=>{
  req.session.admin = null;
  res.redirect('/admin/admin-login');
})

>>>>>>> 44fc99901b655be9570cb355c355657cdc30e2cf
module.exports = router;
