require('dotenv').config()
const adminhelpers = require("../helpers/adminhelpers");
const userhelpers = require("../helpers/userhelpers");
const twilioApi = require('../api/twilio');
const {verifyOtp}=require('../api/twilio')

const { category } = require("../model/connection");
const {user} = require('../model/connection')

var loginheader, loginStatus;



module.exports = {
  getHome: async (req, res) => {
   
    if (req.session.userIn) {
  
      let loginStatus=true;
      let user = req.session.user.username;
      let userId = req.session.user._id;



      const cartCount = await userhelpers.getCartCount(userId);
      wishcount = await userhelpers.getWishCount(userId);
      req.session.cartCount = cartCount;
    
        res.render("user/userhome", {
          loginheader: true,
          cartCount,
          wishcount,
          userName: user,
        });
     
    } else {
      res.render("user/userhome", { loginheader: false });
    }
  },

  showLogin: (req, res) => {
    if (req.session.userIn) {
      let user = req.session.user.username;
      res.render("user/userhome", { loginheader: true, userName: user });
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
    if (req.session.userIn) {
      let user = req.session.user.username;
      let userId = req.session.user._id;
      userhelpers.zoomlistProductShop(req.params.id).then(async (response) => {
        let wishcount = await userhelpers.getWishCount(userId);
        let cartCount = await userhelpers.getCartCount(userId);
        res.render("user/imagezoom", {
          response,
          wishcount,
          cartCount,
          loginheader: true,
          userName: user,
        });
      });
    } else {
      userhelpers.zoomlistProductShop(req.params.id).then((response) => {
        res.render("user/imagezoom", { response, loginheader: false });
      });
    }
  },

  shopView: (req, res) => {
    let shop;
    if (req.session.userIn) {
      var user = req.session.user.username;
      var userId = req.session.user._id;

      userhelpers.listProductShop().then((response) => {
        adminhelpers.findAllcategories().then(async (cat) => {
         
          let cartCount = await userhelpers.getCartCount(userId);
          wishcount = await userhelpers.getWishCount(userId);
          console.log(wishcount, "this is count of wishlist");
          res.render("user/shop", {
            response,shop:true,
            cat,
            loginheader: true,
            cartCount,
            wishcount,
            userName: user,
          });
        });
      });
    } else {
      userhelpers.listProductShop().then((response) => {
        adminhelpers.findAllcategories().then(async (cat) => {
         

          res.render("user/shop", {
            response,shop:true,
            cat,shop,
            loginheader: false,
          });
        });
      });
    }
  },

  //now

  getCategory: async (req, res) => {
    if (req.session.userIn) {
      let user = req.session.user.username;
      let userId = req.session.user._id;
      userhelpers.categorySearch(req.params.id).then((category) => {
        userhelpers.getCat(category[0].CategoryName).then((response) => {
          adminhelpers.findAllcategories().then(async (cat) => {
            let cartCount = await userhelpers.getCartCount(userId);
            let wishcount = await userhelpers.getWishCount(userId);

            res.render("user/shop", {
              response,
              cat,wishcount,
              loginheader: true,
              cartCount,
              userName: user,
            });
          });
        });
      });
    } else {
      userhelpers.categorySearch(req.params.id).then((category) => {
        userhelpers.getCat(category[0].CategoryName).then((response) => {
          adminhelpers.findAllcategories().then(async (cat) => {
            console.log(cat, "yyyyyyyyyyyyy");

            res.render("user/shop", {
              response,
              cat,
              loginheader: false,
            });
          });
        });
      });
    }
  },

  showSignup: (req, res) => {
    // let user=req.session.user.username;
    res.render("user/signup", { emailStatus: true });
  },

  postSignup: (req, res) => {
    console.log(req.body,"this is req.body of signup  form");
    userhelpers.doSignUp(req.body).then((response) => {
      console.log(response);
      var emailStatus = response.status;
      if (emailStatus) {
        
        res.redirect("/login");
      } else {
        res.render("user/signup", { emailStatus });
      }
    });
  },

  generateCoupon: (req, res) => {
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

//newwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
  Otppage:(req,res)=>{
    res.render('user/otpPage', {"otpLoginErr": req.session.userExistErr})
    req.session.userExistErr = false;
 },

sendOtp : (req, res) =>{
    req.session.mobile = req.body.mobile;
    userhelpers.findUser(req.body.mobile).then((user) =>{
        if(user){
            req.session.user = user;
            twilioApi.sendOtp(req.body.mobile).then((result) =>{
                res.json({status : true});
            })
        }else{
            req.session.userExistErr = "The mobile number is not registered with any account"
            res.json({status : false})
        }
       
    })

},


VerifyOtp: (req, res) => {
  console.log(req.session.mobile, "this is mobile........");
  console.log(req.body.otp, "this  is otp...........");

  twilioApi.verifyOtp(req.session.mobile, req.body.otp)
    .then(async(result) => {
      if(result.valid){
        const User = await user.findOne({phoneNumber:req.session.mobile})
          console.log(User)
          if(User){
            req.session.userIn = User
            return res.status(200).json('approved')
          } 
          res.status(400).json({error:true, message: 'user not found pleace create an account'})
      }else{
        // req.session.otpErr = "Invalid otp.."
        req.session.otpErr=true
        res.status(400).json({Invaliderror:true, message: 'invalid  opt!!'})

        // res.redirect('/')
      }
    })
    .catch((err) => {
      console.log('err:',err);
      res.status(500).send({ message: "cant verify the otp...!" });
    });
},

//newwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww


//  sandddddddddddeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeepppppppppppppppppppppppp
  //otp

  // showotp: (req, res) => {
  //   res.render("user/otplogin");
  // },
  
  // postotp: async (req, res) => {
  //   const { mobile } = req.body;
  //   req.session.mobile=mobile;
  //   try {
  //     console.log(mobile, req.body,"mobileeeeeeeee")
  //     client.verify.v2.services(serviceSid)
  //               .verifications
  //               .create({to: `+91${mobile}`, channel: 'sms'})
  //               .then(verification => res.status(200).json(verification.sid));
      
  //   } catch (error) {
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // },

  // verifyOtp:(req,res)=>{
  //     res.render('user/verifyOtp')
  // },


//   postVerifyOtp: async (req, res) => {
//     const {otp} = req.body
//     let mobile=req.session.mobile;
//   console.log(otp)
//     try {
//       client.verify.v2.services(serviceSid)
//       .verificationChecks
//       .create({to: `+91${mobile}`, code: otp})
//       .then( async verification_check => {
//         if(verification_check.status == 'approved'){
//           console.log(verification_check.status)
//           const User = await user.findOne({contactNumber:mobile})
//           console.log(User)
//           if(User){
//             req.session.userIn = User
//             return res.status(200).json({error:false, message: "succesfully logged in"})
//           } 
//           res.status(400).json({error:true, message: 'user not found pleace create and account'})
//         } 
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Internal sever error occured" });
//     }
//   },


// sandeeeeeeeeeeeeeeeeeeeeeeeeeeeeeddddddddddddddddddddddddddddddddddppppppppppppp

  //add-to-cart
  addToCart: (req, res) => {
    try {
      const userId = req.session.user._id;
      const proId = req.params.id;      
      userhelpers.addToCarts(proId, userId).then((data) => {
        console.log(data,"pppppppppppppppppppppp");
        res.json({ status: true});
         
      });
    } catch (error) {
      res.status(500)
    }
     
      
   
  },

  getCartProducts: async (req, res) => {
    let user = req.session.user.username;
    console.log(user,"ooooooi user");
    loginStatus = true;
   
   
     let userId = req.session.user._id;
     console.log(userId,"oooooi id");
    
    let products = await userhelpers.displayProducts(userId);
    console.log(products,"uuuuuuuuuuuuuuuuuuu");
    wishcount = await userhelpers.getWishCount(userId);
    let cartCount = await userhelpers.getCartCount(userId);

    console.log(products,"this is cart items");
    // console.log("======",products[0].proDetails[0].Quantity, "======");

    
   
      res.render("user/cart", {
        products,
        productExist: true,
        cartCount,
        wishcount,
        loginheader: true,
        userName: user,
      });
   
    
  },

  getWishlist: async (req, res) => {
    

     
      userhelpers
        .addToWishList(req.params.id, req.session.user._id)
        .then(() => {
          res.json({
            status: "success",
          });
        });
    
  },

  viewWishList: async (req, res) => {
    wishcount = await userhelpers.getWishCount(req.session.user._id);
    let cartCount = await userhelpers.getCartCount(req.session.user._id);

    console.log(wishcount, "this is count of wishlist");
    let user = req.session.user.username;
    await userhelpers
      .ListWishList(req.session.user._id)
      .then((wishlistItems) => {
        res.render("user/view-wishlist", {
          wishlistItems,
          wishcount,
          cartCount,
          userName: user,
          loginheader: true,
        });
      });
  },

  deleteWishList: async (req, res) => {
    try {
      await userhelpers.getDeleteWishList(req.body).then((response) => {
        res.json(response);
      });
    } catch (error) {
      res.status(500);
    }
  },

  deleteCartProduct: (req, res) => {
    console.log(req.params.id, "ooooooo");
    userhelpers
      .removeItem(req.params.id, req.session.user._id)
      .then((resposne) => {
        res.redirect("/cart");
      })
      .catch((err) => {
        res.redirect("/cart");
      });
  },
 
        
  // changeQuantity: async (req, res) => {
 
  //   let  userId = req.session.user._id;
  //   let quantity=parseInt(req.body.quantity)

  //   console.log(req.body,"body of change quantity..........");

  //   let productDetails = await userhelpers.getOneProduct(req.body.product);
  //   console.log(typeof(quantity));
  //   console.log(productDetails.Quantity , "database quantity");
  //   console.log(quantity,"cart quantity...");
  //   if (productDetails.Quantity < quantity) {
  //     res.json({ stock: "Full" });
  //   } else {
  //     let response = await userhelpers.change_Quantity(req.body);
  //     let total = await userhelpers.getTotalAmount(userId);
  //     let grandTotal = total[0].totalRevenue

      
  //     res.status(200).json(grandTotal);
  //   }
  // },

  changeQuantity: (req, res) => {


    userhelpers.change_Quantity(req.body).then(async (response) => {
        // response.total = await userhelpers.getsubTotal(req.session.user._id)
        // console.log(response,"subtotal respoonse................");
        res.json(response )

    }).catch((error)=>{
        res.status(500)
       })
    },

  placeOrder: (req, res) => {
 
    let  userId = req.session.user._id;
    

    userhelpers.getTotalAmount(userId).then(async (total) => {
      const data = total;

      let value = data[0].totalRevenue;
      let user = req.session.user.username;

      let cartCount = await userhelpers.getCartCount(userId);

      const userDetails = await userhelpers.getUser(userId);

      const coupens = await userhelpers.validCoupens(req.session.user._id);

      let products = await userhelpers.displayProducts(userId);

      let wishcount = await userhelpers.getWishCount(userId);


      res.render("user/checkout", {
        value,
        products,
        loginheader: true,
        cartCount,
        user: userId,
        userName: user,
        address: userDetails.address,
        coupons: coupens,wishcount
      });
    });
  },
  

  postPlaceOrder: async (req, res) => {
    console.log(req.body, "this is req.body");
   
      userId = req.session.user._id;
       let carts = await userhelpers.getCartProductList(req.session.user._id);
    let total = await userhelpers.getTotalAmount(userId);
    // userhelpers.coupenCheck()

    let value = total[0].totalRevenue;
    userhelpers
      .placeOrder(req.body, carts, value, req.session.user._id)
      .then((orderID) => {
        if (req.body["paymentMethod"] == "COD") {
          res.json({ codstatus: true });
        } else {

          userhelpers.generateRazorpay(orderID, value).then((response) => {
            res.json(response);
          });
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
        email: req.body.email,
      },
    };

    
  },

  VerifyOrder: (req, res) => {

    res.redirect("/user/order-success");
   
  },

  saveAddress: (req, res) => {
    const id = "id" + Math.random().toString(16).slice(2);
    userhelpers.saveaddress(req.session.user.email, req.body, id).then(() => {
      res.redirect("/checkout");
    });
  },
  saveprofileAddress: (req, res) => {
    const id = "id" + Math.random().toString(16).slice(2);
    userhelpers.saveaddress(req.session.user.email, req.body, id).then(() => {
      res.redirect("/profile");
    });
  },
  getOrder: async (req, res) => {

    let userId = req.session.user._id;
    let user = req.session.user.username;
    let count = userhelpers.countCoupon(userId);
    let wishcount = await userhelpers.getWishCount(req.session.user._id);
    let cartCount = await userhelpers.getCartCount(userId);
    res.render("user/order-success", {
      loginheader: true,
      user: userId,
      wishcount: wishcount,
      cartCount: cartCount,
      userName: user,
    });

  },

 

  viewOrder: (req, res) => {
    let userId = req.session.user._id;

    let user = req.session.user.username;

    userhelpers.viewUserOrders(userId).then(async (response) => {
      let wishcount = await userhelpers.getWishCount(userId);
      let cartCount = await userhelpers.getCartCount(userId);

      console.log(response, "this is new response...............");
      res.render("user/orders", {
        loginheader: true,
        response,
        wishcount,
        cartCount,
        userName: user,
      });
    });
  },

  viewCoupen: (req, res) => {
    userId = req.session.user._id;
    userName = req.session.user.username;
    let now = Date.now();
    let response = { success: false };
    let expiry = { success: false };
    userhelpers.getUsercoupen(userId).then(async (coupenList) => {
      if ((coupenList.used = false)) {
        response.success = true;
      }
      if (now < coupenList.exp) {
        expiry.success = true;
      }
      let wishcount = await userhelpers.getWishCount(userId);
      let cartCount = await userhelpers.getCartCount(userId);

      res.render("user/view-coupens", {
        coupenList,
        loginheader: true,
        userName: userName,
        wishcount,
        cartCount,
        response,
        expiry,
      });
    });
  },


  applyCoupon: async (req, res) => {
    let userId = req.session.user._id;
    let coupenCode = req.body.couponCode;
    let total = await userhelpers.getTotalAmount(userId);

    const response = await userhelpers.coupenValidate(
      userId,
      coupenCode,
      total
    );
    response ? res.status(200).json(response) : res.status(403).json(response);
  },

  getProfile: async (req, res) => {
    let userId = req.session.user._id;
    
    // console.log(address,"tjhiiiiiiiiiiiiis");
    userhelpers.viewUserOrders(userId).then(async (order) => {
      let details = await userhelpers.getAddress(userId);
      wishcount = await userhelpers.getWishCount(req.session.user._id);
      let cartCount = await userhelpers.getCartCount(userId);
      loginStatus = true;
      let user = req.session.user.username;
      let address=details[0].address
      console.log(details.address,wishcount,cartCount,user,"aaaaaaaaaaaaaaaaaaall in one");
      res.render("user/profile", {
        loginheader: true,
        userName: user,
        wishcount,
        cartCount,
        order,
        address,
      });
    });
  },

  

  orderProducts: async (req, res) => {
    let email = req.session.user.email;
    let subTotal=await userhelpers.getsubTotal(req.session.user._id)

    console.log(subTotal,"joyyyyyyyyyyyyy");
    let order = await userhelpers.getOrderProducts(req.params.id);
    console.log(order[0].products,"ooreeeeeeeeeeeeeeer");
    // for(let i=0;i<order[0].products[0].length;i++){
    //   let sub=order[0].products[0].Price*order[0].products[0].Quantity
    //   console.log(sub,"this is suuuuuuuuuuuuuuuuuuub");
    // }
   
    

    let wishcount = await userhelpers.getWishCount(req.session.user._id);
    let cartCount = await userhelpers.getCartCount(req.session.user._id);
    loginStatus = true;
    let user = req.session.user.username;
    res.render("user/view-order-products", {
      loginheader: true,
      wishcount,
      cartCount,
      userName: user,
      order,
      email,
      subTotal
    });
  },

  cancelOrder: async (req, res) => {
    console.log(req.body, "sagar alias jaaaaaaaaaaaaackie");
    console.log(req.params.id, "bbbbbbbbbbbb");
    // let status= await userhelpers
    let orderStatus = await userhelpers.CancelOrderItem(
      req.params.id,
      req.body.status
    );
    if (orderStatus) {
      res.json({ status: true });
    }
  },

  postSort: async (req, res) => {
    let sortOption = req.body["selectedValue"];
    let viewCategory = await adminhelpers.viewAddCategory();
    userhelpers.postSort(sortOption).then(async (response) => {
      let wishcount = await userhelpers.getWishCount(req.session.user._id);
      let cartCount = await userhelpers.getCartCount(req.session.user._id);
      if (response) {
        res.render("user/shop-new", {
          response,
          viewCategory,
          cartCount,
          wishcount,
        });
      }
    });
  },
//current paneeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
  search: async(req, res) => {        
    const searchValue = req.query.search;
    
    if(req.session.loggedIn) {
        let userId=req.session.user._id;
        let user=req.session.user.username;
        let products;
      
        let wishcount = await userhelpers.getWishCount(userId);
        let cartCount = await userhelpers.getCartCount(userId);
        let cat= await adminhelpers.findAllcategories()
         
       await userhelpers.search({ search: searchValue }).then((response) => {
            if (response.length > 0) {
              res.render('user/shop',
               {userHeader:true,shop:true,
                response,user,cartCount,
                wishcount,cat,userName:user})
            } else {
            res.render('user/searchEmpty', {userHeader:true,shop:false,
              user,cartCount,wishcount,userName:user})
            }
          }).catch((err) => {
            res.json({
              status: 'error',
              message: err.message
            });
          });
    }else{

       userhelpers.search({ search: searchValue }).then(async(response) => {
        let cat= await adminhelpers.findAllcategories()

            if (response.length > 0) {
              res.render('user/shop', {userHeader:false,response,cat,shop:true})
            } else {
            res.render('user/searchEmpty', {userHeader:false,response,shop:false})
            }
          }).catch((err) => {
            res.json({
              status: 'error',
              message: err.message
            });
          });
    }        
},

searchempty:(req,res)=>{
  res.render('user/searchEmpty')
}
};
