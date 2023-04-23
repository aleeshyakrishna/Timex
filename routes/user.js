var express = require('express');
var router = express.Router();
const controller= require("../controller/usercontrol")
const authentication = require('../middleware/middlewares')



router.get('/',controller.getHome)


router.route('/login')
        .get(controller.showLogin)
        .post(controller.postLogin)

router.route('/signup')
    .get(controller.showSignup)
    .post(controller.postSignup)

// router.get('/generateCoupon',controller.generateCoupon)

router.get('/shop',controller.shopView)

router.get('/shop-product',controller.productView)

router.get('/logout',controller.userlogout)

router.get('/otplogin',controller.showotp)

router.post('/sendOtp',controller.postotp)

router.get('/zoomView/:id',controller.zoomshopView)

router.get('/add-to-cart/:id',controller.addToCart)

router.get('/cart',authentication.userAuth,controller.getCartProducts)

router.get('/delete-cart-product/:id',authentication.userAuth,controller. deleteCartProduct)

router.get('/wishlist/:id',authentication.userAuth,controller.getWishlist)

router.get('/view-wishlist',authentication.userAuth,controller.viewWishList)

router.delete('/delete_wishlist',authentication.userAuth, controller.deleteWishList)

// router.get('/get-Wishlist-products',authentication.userAuth,controller.getWishlistProducts)

router.post('/change-product-quantity',authentication.userAuth,controller.changeQuantity) 

router.get('/checkout',authentication.userAuth,controller.placeOrder)

router.post('/checkout',authentication.userAuth,controller.postPlaceOrder)

router.post('/verify-payment',authentication.userAuth,controller.VerifyOrder)

// router.post('/order-place',(req,res)=>{
//     console.log(req.body,"(((((((((((((((((((");
// })

// router.post('/place-order-product',authentication.userAuth,controller.postPlaceOrder)

router.get('/order-success',authentication.userAuth,controller.getOrder)

router.get('/orders',authentication.userAuth,controller.viewOrder)

router.get('/coupens',authentication.userAuth,controller.viewCoupen)

//here

router.post('/get-coupon',authentication.userAuth,controller.applyCoupon)

router.get('/profile',authentication.userAuth,controller.getProfile)

// router.post('/profile-address',authentication.userAuth,controller.postProfile)

router.post('/address',authentication.userAuth,controller.saveAddress)

router.get('/view-order-products/:id',authentication.userAuth,controller.orderProducts)

router.post('/order-cancel/:id',authentication.userAuth,controller.cancelOrder)









module.exports = router;
