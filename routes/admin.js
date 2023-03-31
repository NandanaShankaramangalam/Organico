var express = require('express');
var router = express.Router();
const adminHelpers=require('../helpers/adminHelpers');
const fs = require('fs');
const { showCategory } = require('../helpers/adminHelpers');
var nocache = require('nocache');
const userHelpers = require('../helpers/userHelpers');
const adminController = require('../controller/adminController');


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
router.get('/getChart-Data',adminController.chartData);

router.get('/admin-login',nocache(),adminController.adminLogin);
router.post('/admin-login',nocache(),adminController.adminCheck);

// router.get('/dashboard',adminController.dashboard);

router.get('/user-list',verifyLogin,adminController.getUsers);

router.get('/delete-user/:id',verifyLogin,adminController.deleteUsers);

router.get('/block-user/:id',verifyLogin,adminController.blockUsers);

router.get('/unblock-user/:id',verifyLogin,adminController.unblockUsers);

router.get('/add-product',verifyLogin,adminController.showProducts);

router.post('/add-product',adminController.addProducts);

router.get('/product-list',verifyLogin,adminController.getProducts);

router.get('/delete-product/:id',verifyLogin,adminController.deleteProducts);
router.get('/list-product/:id',verifyLogin,adminController.listProducts);

router.get('/edit-product/:id',verifyLogin,adminController.editProducts);

router.post('/edit-product/:id',verifyLogin,adminController.insertEditedProducts);

router.get('/add-category',verifyLogin,adminController.showCategory);

router.post('/add-category',verifyLogin,adminController.addCategory)

router.get('/edit-category/:id',verifyLogin,adminController.editCategory);
router.post('/edit-category/:id',verifyLogin,adminController.updateCategory);

router.get('/delete-category/:id',verifyLogin,adminController.deleteCategory);
router.get('/list-category/:id',verifyLogin,adminController.listCategory);

router.get('/order-list',verifyLogin,adminController.getOrderList);

router.get('/order-details/:id',verifyLogin,adminController.getOrderDetails);
router.post('/order-details/:id',adminController.updateOrderStatus);

router.get('/coupon',verifyLogin,adminController.getCoupon);
router.post('/coupon',verifyLogin,adminController.addCoupon); 

router.get('/coupon-list',verifyLogin,adminController.getCouponList);

router.get('/edit-coupon/:id',verifyLogin,adminController.getEditCoupon);
router.post('/edit-coupon/:id',verifyLogin,adminController.updateCoupon);

router.get('/remove-coupon/:id',verifyLogin,adminController.removeCoupon);
// router.post('/update-order-status',adminController.updateOrderStatus);

router.get('/banner',verifyLogin,adminController.banner);
router.post('/banner',verifyLogin,adminController.uploadBanner);

router.get('/sales-report',verifyLogin,adminController.getSalesReport);

router.get('/logout',verifyLogin,adminController.logout);

module.exports = router;

