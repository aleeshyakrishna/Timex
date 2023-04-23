const adminhelpers = require("../helpers/adminhelpers");
const userhelpers = require("../helpers/userhelpers");
const { category } = require("../model/connection");

var loginheader, loginStatus;

module.exports = {
  getHome: async (req, res) => {
    let userId;
    if (req.session.userIn) {

      // console.log(req.session.user, "kkkkkoiiiiiii");
      userId = req.session.user._id;
      console.log(userId);
    }
    if (loginStatus) {
        let user=req.session.user.username;
        console.log(user,">>>>>>>>>>>>>>>>>>>>>>>>>>");
      const cartCount = await userhelpers.getCartCount(userId);
      console.log(cartCount);
      req.session.cartCount = cartCount;
      if (cartCount) {
        res.render("user/userhome", { loginheader: true, cartCount, userName:user});
      } else {
        res.render("user/userhome", { loginheader: true,userName:user });
      }
    } else {
      res.render("user/userhome", { loginheader: false });
    }
  },

  showLogin: (req, res) => {
    if (req.session.userIn) {
        let user=req.session.user.username;
      res.render("user/userhome", { loginheader: true,userName:user });
    } else {
      res.render("user/login");
    }
  },
  postLogin: (req, res) => {
    userhelpers.dologin(req.body).then((response) => {
      console.log(response);

      loginheader = true;
      loginStatus = response.status;

      var blockedStatus = response.blockedStatus;
      req.session.userIn = true;

      if (loginStatus) {
        console.log(response);
        req.session.user = response.response.user;

        // console.log(req)
        // console.log(req.session.user_id,'kkkkkkkkkkkkkkkkkkkko')
        req.session.userIn = true;

        res.redirect("/");
      } else {
        res.render("user/login", { loginStatus, blockedStatus, login: false });

        console.log(blockedStatus + "blocked status");
        console.log(loginStatus + "log");
      }
    });
  },
  zoomshopView: (req, res) => {

    if(req.session.userIn){
      let user=req.session.user.username;
    userhelpers.zoomlistProductShop(req.params.id).then((response) => {
      console.log(response,"///////////mmmmmmmmmmm////////mmmmmmmmm");
      res.render("user/imagezoom", { response, loginheader: true ,userName:user});
    });
    }else{
    
    userhelpers.zoomlistProductShop(req.params.id).then((response) => {
     
      res.render("user/imagezoom", { response, loginheader: false});
    });
    }
    
  },

  shopView: (req, res) => {
    if (req.session.userIn){
      
      var user=req.session.user.username;
      var userId = req.session.userIn._id;
   

      userhelpers.listProductShop().then((response) => {
        adminhelpers.findAllcategories().then(async (cat) => {
          // cartCount=req.session.cartCount
          let cartCount = await userhelpers.getCartCount(userId);
          console.log(cartCount + "[[[[[[[[[[=====");
  
          res.render("user/shop", {
            response,
            cat,
            loginheader: true,
            cartCount,
            userName:user
          });
        });
      });
    }
    else{
      userhelpers.listProductShop().then((response) => {
        adminhelpers.findAllcategories().then(async (cat) => {
          // cartCount=req.session.cartCount
          // let cartCount = await userhelpers.getCartCount(userId);
          // console.log(cartCount + "[[[[[[[[[[=====");
  
          res.render("user/shop", {
            response,
            cat,
            loginheader: false,
            
            
          });
        });
      });
    }
    
    
    
   
  },

  productView: (req, res) => {
    let user=req.session.user.username;
    res.render("user/shop-product-right", { loginheader: true ,userName:user});
  },

  showSignup: (req, res) => {
    // let user=req.session.user.username;
    res.render("user/signup", { emailStatus: true });
  },

  postSignup: (req, res) => {
   
    userhelpers.doSignUp(req.body).then((response) => {
      console.log(response);
      var emailStatus = response.status;
      if (emailStatus) {
        //generate coupen
        // res.redirect('/generateCoupon')
        res.redirect("/login");
      } else {
        res.render("user/signup", { emailStatus, });
      }
    });
  },

  generateCoupon:(req,res)=>{
   
      userhelpers.generateNewCoupon().then((response) => {
        res.json(response);
      });
   
  },

  userlogout: (req, res) => {
    loginheader = false;
    loginStatus = false;
    req.session.userIn = false;

    res.redirect("/");
  },

  //otp

  showotp: (req, res) => {
    res.render("user/otplogin");
  },
  postotp: (req, res) => {
    userhelpers.otpverification(req.body).then((response) => {
      if (response.blocked) {
        loginStatus = false;
        res.redirect("/otplogin");
      } else {
        req.session.userIn = true;
        loginStatus = true;
        res.redirect("/");
      }
    });
  },

  //add-to-cart
  addToCart: (req, res) => {
    if(req.session.userIn){
      const userId = req.session.user._id;
      console.log(userId, "this is useriddddddddddddddddd");
      const proId = req.params.id;
      //console.log(proId,'llllllllll')
      userhelpers.addToCarts(proId, userId).then(() => {
        res.json({
          status: "success",
        });
      });
    }else{
      console.log("nnnnnnnnnnnnoooooooooo");
      res.render('user/login',{loginheader:false})
    }
    
  },

  getCartProducts:async (req, res) => {
    let user=req.session.user.username;
    loginStatus = true;
    let userId;
    if (req.session.user) {
      userId = req.session.user._id;
    }
    let products =await userhelpers.displayProducts(userId)
      
      let cartCount = await userhelpers.getCartCount(userId);
      // console.log(cartCount, "======");
      if (cartCount) {
        res.render("user/cart", {
          products,
          productExist: true,
          cartCount,loginheader: true,
          userName:user
        });
      } else {
        res.render("user/cart", { productExist: false, loginheader: true,userName:user,products });
      }
    
  },

 
    
getWishlist: async (req, res) => {
  if(req.session.userIn){
    console.log("hi this is productId");
    console.log(req.params.id,"<<<<.....wishlistid......>");
    console.log(req.session.user._id,"<<<<<.......userId......>>>>");

    // userhelpers.addToCarts(proId, userId).then(() => {
    //   res.json({
    //     status: "success",
    //   });
    // });

  userhelpers
          .addToWishList(req.params.id, req.session.user._id)
          .then(() => {
            res.json({
              status: "success",
            });
          });
  }

 
    },

    viewWishList:async(req,res)=>{
     
        wishcount = await userhelpers.getWishCount(req.session.user._id)
        console.log(wishcount,"this is count of wishlist");
      let user=req.session.user.username;
        await userhelpers
          .ListWishList(req.session.user._id)
          .then((wishlistItems) => {
            console.log(wishlistItems,"asasasasasasas");
    
            res.render("user/view-wishlist", {
              wishlistItems,
              wishcount,
              userName:user,
             loginheader:true,
             
            });
          });
     
    },

    deleteWishList: async (req, res) => {
      console.log("leeeeeeeeeeeeeleeeelee");
      console.log(req.body,"leeeeeeeeeeeeeeeeeeeeeeeeeee");
      console.log("lelelelelelellelelelle");
      try {
        await userhelpers.getDeleteWishList(req.body).then((response) => {
  
          res.json(response)
  
        })
      } catch (error) {
        res.status(500)
      }
  
    },
 
    
  

  deleteCartProduct: (req, res) => {
    console.log(req.params.id,"ooooooo")
    userhelpers
      .removeItem(req.params.id, req.session.user._id)
      .then((resposne) => {
      
        res.redirect("/cart");
      })
      .catch((err) => {
        res.redirect("/cart");
      });
  },

  

  changeQuantity: async (req, res) => {
    if (req.session.user) {
      userId = req.session.user._id;
    }
    console.log(req.body.product,'000000000000000');

    let productDetails = await userhelpers.getOneProduct(req.body.product)
    console.log(productDetails,'aleeeeeee');
    if(productDetails.Quantity<req.body.quantity){
      res.json({stock:'Full'})
    }
    else{

      
    let response = await userhelpers.change_Quantity(req.body);
    let total = await userhelpers.getTotalAmount(userId);
    let grandTotal = total[0].totalRevenue;
    console.log("qqqqqqqqqqq",response, "qqqqqqqqqqqqqqqqq");
    console.log("pppppppppppp",grandTotal, "pppppppppppppppppppppp");

    // res.json(response,grandTotal)
    // res.status(response).json(grandTotal);
    res.status(200).json(grandTotal);

    }

  },

  placeOrder: (req, res) => {
    if (req.session.user) {
      userId = req.session.user._id;
    }

    userhelpers.getTotalAmount(userId).then(async (total) => {
      // console.log(total, "///////////");
      const data = total;

      let value = data[0].totalRevenue;
      // console.log(value, "......> total");
      let user=req.session.user.username;

      let cartCount = await userhelpers.getCartCount(userId);

      const userDetails=await userhelpers.getUser(userId)

      const coupens=await userhelpers.validCoupens(req.session.user._id)

      let products=await userhelpers.displayProducts(userId)
     

      console.log('iikkkkkkkkkkkkkkuuuu',userDetails.address);
      //   value = total[0].totalRevenue;
      res.render("user/checkout", {
        value,
        products,
        loginheader: true,
        cartCount,
        user: userId,
        userName:user,
        address:userDetails.address,
        coupons:coupens
      });
    });
  },
//----------
  //   postPlaceOrder: async(req, res) => {
  //     console.log(req.body,"??????????<<<<<<<<<?????");
  //     let products = await userhelpers.cartOrder(req.body.userId);
  //     console.log(products,'iiiiiiiiiiiiiiiiiiiiiiiiiiiii')
  //     let totalPrice = await userhelpers.getTotalAmount(req.body.userId);
  //     userhelpers.placeOrder(req.body, products, totalPrice).then((response)=>{
  //         res.json({status:true})
  //     })
  
  //           },

  postPlaceOrder: async (req, res) => {
    console.log(req.body, "this is req.body");
    if (req.session.user) {
      userId = req.session.user._id;
    }
    let carts = await userhelpers.getCartProductList(req.session.user._id);
    let total = await userhelpers.getTotalAmount(userId);
    // userhelpers.coupenCheck()
              
    let value = total[0].totalRevenue
    userhelpers
      .placeOrder(req.body, carts, value, req.session.user._id)
      .then((orderID) => {
        if (req.body["paymentMethod"] == "COD") {
          res.json({ codstatus: true });
        } else {
          userhelpers.generateRazorpay(orderID,value).then((response)=>{
              res.json(response)
          })
        }
      });

    const newaddress = {
      user: userId,

      address: {
        name: req.body.name,
        contactNumber: req.body.contactNumber,
        firstLine: req.body.firstLine,
        secondLine: req.body.secondLine,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        email:req.body.email
      },
    };

    // userhelpers.postAddresses(userId, newaddress).then((response) => {
    //   req.session.address = newaddress.address;
    //   let address = req.session.address;
    //   // res.render("user/shop-checkout",{loginheader:true,address,response})
    // });
  },

  VerifyOrder:(req,res)=>{
   
      console.log(req.body,":::;;;::::;;;;::::;;;;:::;;;::;;;:::::;;;;::");

      res.redirect('/user/order-success');
      // res.json({
      //   status: true
      // })
  },

  saveAddress:(req,res)=>{
    // console.log(req.body,"............>>>...........");
      const id="id"+Math.random().toString(16).slice(2);
      userhelpers.saveaddress(req.session.user.email,req.body,id).then(()=>{
        res.redirect('/checkout')
      })
       
        
  },
//coupeeeeeeeeeeeeeeeeen
   getOrder: (req, res) => {
    // console.log("llllllllllll");

    let userId = req.session.user._id;
    let user=req.session.user.username;
    let count=userhelpers.countCoupon(userId)
    

        
      res.render("user/order-success", { loginheader: true, user: userId,userName:user });
    
    
    // const cartCount = await userhelpers.getCartCount(userId);
    
  },

  //   viewOrder:(req,res)=>{
  //     let userId=req.session._id;
  //     res.render('user/orders',{loginheader:true,user:userId,})
  //   },

  viewOrder: (req, res) => {
    if (req.session.user) {
      userId = req.session.user._id;
      
    }
    let user=req.session.user.username;
    
    userhelpers.viewUserOrders(userId).then((response) => {
      console.log(response, "this is new response...............");
      res.render("user/orders", { loginheader: true, response,userName:user });
    });
  },

  viewCoupen:(req,res)=>{
    userId=req.session.user._id;
    userName=req.session.user.username;
    let now = Date.now()
    let response={success:false}
    let expiry={success:false}
    userhelpers.getUsercoupen(userId).then((coupenList)=>{
      if(coupenList.used=false){

         response.success=true
      }
      if(now<coupenList.exp){

        expiry.success=true
      }
    
      
      res.render('user/view-coupens',{coupenList,loginheader:true,userName:userName,response,expiry})
    })
     
  },

  //here

  applyCoupon:async(req,res)=>{
    let userId=req.session.user._id
    let coupenCode=req.body.couponCode
    let total = await userhelpers.getTotalAmount(userId)

    const response = await  userhelpers.coupenValidate(userId,coupenCode,total)
    response
    ?res.status(200).json(response)
    :res.status(403).json(response)
  },

  getProfile:async(req,res)=>{
    console.log(".............>",req.session.user.address,"...........>");
    let userId=req.session.user._id
    let address= req.session.user.address
    userhelpers.viewUserOrders(userId).then((order) => {
      // let address=order[0].deliveryDetails;
    //     console.log(response, "this is new response..........");
    loginStatus=true;
    let user=req.session.user.username;
    res.render('user/profile',{loginheader:true,userName:user,order,address})
      }
    )
    
  },

  // postProfile:(req,res)=>{
  //   let user=req.session.user.username;
  //   let addressProfile=req.body;
  //   console.log(req.body,"post address profile");
    
  //   res.redirect('back')
  //   // const id="id"+Math.random().toString(16).slice(2);
  //   //   userhelpers.saveaddress(req.session.user.email,req.body,id).then(()=>{
  //   //     res.redirect('/checkout')
    

  // },

  orderProducts:async(req,res)=>{
      console.log(req.params.id,"?????");
      let order=await userhelpers.getOrderProducts(req.params.id)
      loginStatus=true
      let user=req.session.user.username;
      res.render('user/view-order-products',{loginheader:true,userName:user,order})
  },

  cancelOrder:async(req,res)=>{
    console.log(req.body,"sagar alias jaaaaaaaaaaaaackie");
    console.log(req.params.id,"bbbbbbbbbbbb");
    // let status= await userhelpers
      let orderStatus= await userhelpers.CancelOrderItem(req.params.id,req.body.status)
      if(orderStatus){
        res.json({status:true})
      } 
  }
};
