var express = require('express');
const { default: mongoose } = require('mongoose');
const userHelpers = require('../helpers/userHelpers');
var router = express.Router();
const user = require('../model/userSchema');
var nocache = require('nocache');
const userController = require('../controller/userController');
const productController = require('../controller/productController');
const cartController = require('../controller/cartController');

/* GET home page. */
  let verifyLogin=(req,res,next)=>{
    if(req.session.user){
      next()
    }else{
      res.redirect('/user-login')
    }
  }

router.get('/',nocache(),userController.getHome);

// router.get('/',nocache(), async function(req, res, next) {
//   let user=req.session.user;
//   console.log("user",user);
//   let cartCount = null;
//   if(user){ 
//      cartCount = await userHelpers.getCartCount(req.session.user._id);
//      req.session.cartCount = cartCount;
//   }
  
//   console.log(user);
//   userHelpers.showProducts().then((products)=>{
//     res.render('user/home',{products,user,cartCount});
//   }) 
   
// });


router.get('/user-signup',nocache(),userController.userSignup);
router.post('/user-signup',userController.insertUser);

router.get('/user-login',nocache(),userController.userLogin);
router.post('/user-login',userController.userCheck);

router.get('/otp-login',nocache(),userController.getOtpLogin)
// router.get('/otp-login',nocache(),(req,res)=>{
//   var user=req.session.user
//   if(user){
//     res.redirect('/')
//   }else{
//   otp=req.session.otp
//   data=req.session.otpData
//   err=req.session.otpErr
//   invalid=req.session.InvalidOtp
//   res.render('user/otp-login',{otp,data,err,invalid})
//   req.session.otpErr=null
//   req.session.otpData = null;
//   }
  
// })

router.post('/sent-otp',userController.otpVerification)

// router.post('/sent-otp',(req,res)=>{
//   userHelpers.otpVerification(req.body).then((response)=>{
//     if(response.status){
//       req.session.otp=response.otp;
//       req.session.otpData=req.body;
//       req.session.otpUser=response.user;
//       res.redirect('/otp-login')
//     }else{
//       req.session.otpErr=response.err
//       res.redirect('/otp-login')
//     }
//   })
// })
router.post('/otp-login',userController.otpLogin);

// router.post('/otp-login',(req,res)=>{
//   otp=req.session.otp
//   userOtp=req.body.otp
//   var user=req.session.otpUser
//   if(otp==userOtp){
//     req.session.user=user
//     req.session.otp=null
//     res.redirect('/')   
//   }else{
//     req.session.InvalidOtp="Invalid Otp"
//     res.redirect('/otp-login')
//   }
// })

router.get('/shop',productController.showProducts);

// router.get('/shop',(req,res)=>{
// let user=req.session.user;
// let cartCount = req.session.cartCount;
// console.log("count === ",cartCount);
//   userHelpers.showProducts().then((products)=>{
//     res.render('user/shop',{products,user,cartCount});
//     console.log(products);
//   })
// }) 

router.get('/single-product/:id',productController.showSingleProduct); 

router.get('/add-to-cart/:id',verifyLogin,cartController.addToCart);

router.get('/cart',verifyLogin,cartController.getCartProducts);

router.post('/change-product-quantity',verifyLogin,cartController.changeProductQuantity)

router.get('/remove-product/:id',verifyLogin,productController.removeProduct);

router.get('/place-order',verifyLogin,cartController.getPlaceOrder);
router.post('/place-order',verifyLogin,cartController.placeOrder);

router.get('/order-placed',nocache(),verifyLogin,cartController.orderPlaced);

router.post('/get-search-result',productController.search);
router.post('/filter',productController.filter);
router.post('/sort',productController.sort);
router.post('/category',productController.categories);
router.get('/category-all',productController.categoriesAll);
router.get('/pagination/:id',productController.pagination);

router.get('/edit-address/:id',verifyLogin,userController.selectEditAddress);

router.post('/edit-address/:id',userController.updateAddress);

router.get('/view-address-book',verifyLogin,userController.viewAddressBook);

// Later
router.get('/user-profile',verifyLogin,userController.getUserInfo);

router.post('/update-user-profile/:id',verifyLogin,userController.userInfoUpdate);

router.get('/my-orders',verifyLogin,userController.getMyOrders)

router.get('/view-ordered-products/:id([0-9a-fA-F]{24})',verifyLogin,userController.getOrderedProducts)

// router.get('/remove-order/:id',userController.removeOrder);

router.get('/cancel-order/:id',verifyLogin,userController.cancelOrder);
  
router.get('/change-password/:id',verifyLogin,userController.getChangePasword);

router.post('/change-password/:id',verifyLogin,userController.changePassword);

router.get('/address-book',verifyLogin,userController.getAddress);

router.get('/add-address',verifyLogin,userController.getAddAddress);
router.post('/add-address',userController.addAddress);

router.get('/remove-address/:id',verifyLogin,userController.removeAddress)

router.get('/select-address/:id',verifyLogin,userController.selectAddress);

router.post('/apply-coupon',verifyLogin,cartController.applyCoupon); 

router.get('/wishlist',verifyLogin,userController.wishList);
router.get('/wishlist/:id',verifyLogin,userController.addToWishList);
router.get('/remove-wishlist-product/:id',verifyLogin,productController.removeWishListProduct);

router.post('/verify-payment',verifyLogin,cartController.verifyPayment);

router.get('/invoice/:id',verifyLogin,cartController.invoice);

router.get('/forgot-password',userController.getForgotPasword);

router.get('/verify-otp',userController.verifyOtp);
router.post('/verify-otp',userController.verifyPasswordOtp);

router.get('/set-forgot-password',userController.setForgotPassword);
router.post('/set-forgot-password',userController.resetNewPassword);

router.post('/forgot-password-otp',userController.generateOtp);

router.get('/contact-us',userController.getContactUs);
router.post('/contact-us',userController.contactUs);

router.get('/about',userController.about);

router.get('/logout',verifyLogin,userController.logout);

module.exports = router;  
 