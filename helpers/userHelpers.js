const bcrypt = require("bcrypt");
const { isObjectIdOrHexString } = require("mongoose");
const { user, cart } = require("../model/connection");
const db = require("../model/connection");
const ObjectId = require("mongodb").ObjectId;
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto=require("crypto")

var instance = new Razorpay({
  key_id: "rzp_test_D8YlCeAgArP4IA",
  key_secret: "pVNA7ImyxnRLRazFqdsRmcJZ",
});

module.exports = {
  doSignUp: (userData) => {
    //console.log(db);
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        email = userData.email;
        existingUser = await db.user.findOne({ email: email });
        if (existingUser) {
          response = { status: false };
          return resolve(response);
        } else {
          var hashPassword = await bcrypt.hash(userData.password, 10);
          const data = {
            username: userData.username,
            Password: hashPassword,
            email: userData.email,
            phoneNumber: userData.phonenumber,
          };
          console.log(data);
          await db.user.create(data).then((data) => {
            resolve({ data, status: true });
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  //kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk

  // generateNewCoupon:(req,res)=>{
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       let couponCode = voucher_codes.generate({
  //         length: 6,
  //         count: 1,
  //         charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  //         prefix: "WHITE-",
  //       });
  //       resolve({ status: true, couponCode: couponCode[0] });
  //     } catch (err) {
  //       console.log(err);
  //     }
  //     console.log(coupenCode,"kkkkkkkkkkkkkkkkkkkkkkkkkk");
  //   });
  // },

  //kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  dologin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let users = await db.user.findOne({ email: userData.email });
        //console.log(users);
        if (users) {
          if (users.blocked == false) {
            await bcrypt
              .compare(userData.password, users.Password)
              .then((status) => {
                if (status) {
                  response.user = users;
                  resolve({ response, status: true });
                } else {
                  resolve({ blockedStatus: false, status: false });
                }
              });
          } else {
            resolve({ blockedStatus: true, status: false });
          }
        } else {
          resolve({ blockedStatus: false, status: false });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  zoomlistProductShop: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .findOne({ _id: productId })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  listProductShop: () => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  otpverification: (otpvariable) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .findOne({
          phoneNumber: otpvariable,
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  addToCarts: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      let proobj = {
        product: ObjectId(proId),
        quantity: 1,
      };
      let obj = {
        userid: userId,
        products: proobj,
      };
      let usercart = await db.cart.find({ userid: userId });
      if (usercart.length < 1) {
        db.cart.create(obj);
        resolve();
      } else {
        let proExist = await db.cart.findOne({
          userid: userId,
          "products.product": ObjectId(proId),
        });
        console.log(proExist + "PRO EXIST TTT TTT");
        if (proExist) {
          db.cart.findOneAndUpdate(
            { userid: userId, "products.product": ObjectId(proId) },
            { $inc: { "products.$.quantity": 1 } },
            function (err) {
              if (err) {
                console.log(err);
              }
            }
          );
        } else {
          db.cart.findOneAndUpdate(
            { userid: userId },
            { $push: { products: proobj } },
            function (err) {
              if (err) {
                console.log(err);
              }
            }
          );
        }
      }
      resolve();
    });
  },

  //cart display
  displayProducts: (usersId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userId = new ObjectId(usersId);
        let cartItems = await db.cart.aggregate([
          {
            $match: {
              userid: userId,
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": "$products.quantity",
              product: "$products.product",
              sample: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },
          {
            $project: {
              product: 1,
              proDetails: 1,
              "products.quantity": 1,
              price: "$sample.Price",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": 1,
              _id: 1,
              subtotal: {
                $multiply: [
                  {
                    $toInt: "$products.quantity",
                  },
                  {
                    $toInt: "$price",
                  },
                ],
              },
            },
          },
        ]);

        console.log(cartItems, "llllllllllllllllllllllllllllllllllllllllll");
        resolve(cartItems);
      } catch {
        resolve(null);
      }
    });
  },

  getCartCount: async (userId) => {
    let count = 0;
    return new Promise(async (resolve, reject) => {
      console.log(userId);
      let cart = await db.cart.findOne({ userid: userId });
      console.log(cart);
      if (cart) {
        count = cart.products.length;
        console.log(count);
      }
      resolve(count);
      console.log(count);
    });
  },

  removeItem: (proId, userId) => {
    return new Promise((resolve, reject) => {
      db.cart
        .updateOne(
          { userid: userId, "products.product": ObjectId(proId) },
          { $pull: { products: { product: ObjectId(proId) } } }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  //change quantity
  change_Quantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.cart
          .findOneAndUpdate(
            { _id: details.cart },
            {
              $pull: { products: { product: ObjectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.cart
          .findOneAndUpdate(
            {
              _id: details.cart,
              "products.product": ObjectId(details.product),
            },
            { $inc: { "products.$.quantity": details.count } }
          )
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(userId);
        let uId = ObjectId(userId);
        let total = await db.cart.aggregate([
          {
            $match: {
              userid: uId,
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $project: {
              _id: 0,
              cart: "$products.product",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "cart",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              quantity: 1,
              prod: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },
          {
            $project: {
              _id: 0,
              price: "$prod.Price",
              quantity: 1,
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
            },
          },
        ]);
        // console.log(total[0].total,"++************++");
        resolve(total);
      } catch {
        resolve(null);
      }
    });
  },

  //   postAddresses:(userId,newaddress)=>{
  //     return new Promise((resolve,reject)=>{
  //       db.user.updateOne({_id:userId},{$push:{address:newaddress.address}}).then((toAddress)=>{
  //         console.log(toAddress,'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqw')
  //         resolve(toAddress)
  //       })
  //       .catch((error)=>{
  //         reject(error)
  //       })
  //     })
  // },

  saveaddress: (email, data, id) => {
    console.log(email, "rrrrrrrrrrrr");
    const newaddress = {
      id: id,
      name: data.name,
      contactNumber: data.contactNumber,
      firstLine: data.firstLine,
      secondLine: data.secondLine,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      email: email,
    };

    return new Promise(async (resolve, reject) => {
      const addressDetails = await db.user.updateMany(
        { email: email },
        {
          $push: {
            address: newaddress,
          },
        }
      );
      console.log("address details are......", addressDetails);
      resolve();
    });
  },
//kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  countCoupon: (user) => {
  db.coupon.countDocuments({}, function (err, count) {
  if (err) {
    console.log(err);
  } else {
    const randomIndex = Math.floor(Math.random() * count);
    
    db.coupon.findOne().skip(randomIndex).exec(function (err, result) {
      if (err) {
        console.log(err);
      }

    const codeLength = 4; 
   const code = crypto.randomBytes(codeLength).toString('hex').toUpperCase();
    console.log(code,"this is crypto codeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");


  const createDate = Date.now()
  let exp = new Date(createDate)
  exp.setDate(exp.getDate()+ 10)


    let document={
      couponId:result._id,
      userId:user,
      couponCode:result.couponName,
      discount:result.discount,
      used:false,
      code:code,
      createDate : createDate.toLocaleString(),
      exp:exp.toLocaleString()

    }

    db.userCoupon
    .create({

      couponId:result._id,
      userId:user,
      couponCode:result.couponName,
      discount:result.discount,
      used:false,
      code:code,
      createDate : createDate.toLocaleString(),
      exp:exp.toLocaleString()
      
    })
    });
  }
});

},

  getCartProductList: (userId) => {
   
    return new Promise(async (resolve, reject) => {
      try {
        await db.cart
          .aggregate([
            {
              $match: {
                userid: ObjectId(userId),
              },
            },
            {
              $unwind: {
                path: "$products",
                includeArrayIndex: "string",
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "products.product",
                foreignField: "_id",
                as: "proDetails",
              },
            },
            {
              $unwind: {
                path: "$proDetails",
                includeArrayIndex: "string",
              },
            },
            {
              $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                  _id: 0,
                  Name: "$proDetails.Productname",
                  Discription: "$proDetails.ProductDescription",
                  Quantity: "$products.quantity",
                  Image: "$proDetails.Image",
                  Price: "$proDetails.Price",
                  Category: "$proDetails.Category",
                },
            },
          ])
          .then((cart) => {
            console.log("aggregate output", cart);
            resolve(cart);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  addToWishList: (proId, userId) => {
    let proObj = {
      productId: proId,
    };

    return new Promise(async (resolve, reject) => {
      let wishlist = await db.wishlist.findOne({ user: userId });
      if (wishlist) {
        let productExist = wishlist.wishitems.findIndex(
          (item) => item.productId == proId
        );
        if (productExist == -1) {
          db.wishlist
            .updateOne(
              { user: userId },
              {
                $addToSet: {
                  wishitems: proObj,
                },
              }
            )
            .then(() => {
              resolve({ status: true });
            });
        }
      } else {
        const newWishlist = new db.wishlist({
          user: userId,
          wishitems: proObj,
        });

        await newWishlist.save().then(() => {
          resolve({ status: true });
        });
      }
      resolve();
    });
  },

  ListWishList: (userId) => {
    console.log("this is wishlist.........");
    console.log(userId, "this is user Id view wishlist");
    return new Promise(async (resolve, reject) => {
      await db.wishlist
        .aggregate([
          {
            $match: {
              // user: ObjectId(userId)
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: {
              path: "$wishitems",
              includeArrayIndex: "string",
            },
          },
          {
            $project: {
              // item: '$wishitems.productId',
              item: "$wishitems.productId",
            },
          },
          {
            $lookup: {
              // from: 'product',
              // localField: "item",
              // foreignField: "_id",
              // as: 'wishlist'

              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "wishlist",
            },
          },
          {
            $unwind: "$wishlist",
          },

          {
            $project: {
              item: 1,
              //  wishlist: { $arrayElemAt: ['$wishlist', 0] }

              Productname: "$wishlist.Productname",
              Price: "$wishlist.Price",
              Image: "$wishlist.Image",
            },
          },

          //this is my aggregation
          // {
          //   '$match': {
          //     'user': new ObjectId('userId')
          //   }
          // }, {
          //   '$unwind': {
          // 'path': '$wishitems',
          // 'includeArrayIndex': 'string'

          // }, {
          //   '$project': {
          //     'item': '$wishitems.productId'
          //   }
          // }, {
          //   '$lookup': {
          //     'from': 'products',
          //     'localField': 'item',
          //     'foreignField': '_id',
          //     'as': 'wishlist'
          //   }
          // }, {
          //   '$unwind':
          //      '$wishlist'

          // }, {
          //   '$project': {
          //     'item': 1,
          //     'wishlist': [
          //       {
          //         'Productname': '$wishlist.Productname',
          //         'Price': '$wishlist.Price',
          //         'Image': '$wishlist.Image'
          //       }
          //     ]
          //   }
          // }
        ])
        .then((wishlist) => {
          console.log(wishlist);
          console.log("hhhhhhhhhhhhhhhhh");
          resolve(wishlist);
        });
    });
  },

  getWishCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlist = await db.wishlist.findOne({ user: userId });
      if (wishlist) {
        count = wishlist.wishitems.length;
      }

      resolve(count);
    });
  },

  placeOrder: (order, carts, total, userId) => {
    console.log(total, "this is total..........");
    console.log(userId, "//////.......///");
    return new Promise((resolve, reject) => {
      console.log(order, "this is order");
      // console.log(order.flexRadioDefault, ":::LLLLLLLLLL:::::::::");

      const cartId = order.flexRadioDefault;

      db.user
        .findById(userId)
        .select("address")
        .then((user) => {
          var cartAddress = user.address.find(
            (a) => a._id.toString() === cartId
          );

          // console.log(carts,"this is carts");
          let status = order["paymentMethod"] === "COD" ? "placed" : "pending";
          db.order
            .create({
              deliveryDetails: {
                address: cartAddress.firstLine,
                mobile: cartAddress.contactNumber,
                pincode: cartAddress.pincode,
              },
              userId: ObjectId(userId),
              paymentMethod: order["paymentMethod"],
              products: carts,

              status: status,
              totalAmount: total,
              // discount:discount,
              date: new Date(),
              // cartId:carts._id
            })
            .then(async (response) => {
              // response.orderId=_id;
              // console.log(response,"dddddddddddddddddd");
              if (response) {
                await db.cart.deleteMany({ userId: ObjectId(userId) });
              }

              resolve(response._id);
            });

           
        });
    });
  },

  // },
  // coupenCheck:async(userId,code)=>{
  //   await db.userCoupon.findOneAndUpdate({userId: user, code: code},
  //     {$set:{used:true}},
  //     {new:true})
  // },

  generateRazorpay: (orderId, totalPrice) => {
    console.log(orderId, "///////");
    console.log(totalPrice, "/////////");
    // console.log(total[0].total,"++************++");
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice * 100,
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log("New order:", order);
          resolve(order);
          console.log("finish");
        }
      });
    });
  },

  viewUserOrders: (userId) => {
    console.log(userId, "kooooooooooookkaaaelu");
    // console.log(req.params._id,"///////////////");
    return new Promise(async (resolve, reject) => {
      if (!mongoose.isValidObjectId(userId)) {
        return reject(new Error("Invalid userId parameter"));
      }
      // console.log(mongoose.Types.ObjectId(userId),";;;;;;;;;;;;;'''''''");
      let orders = await db.order.find({
        userId: mongoose.Types.ObjectId(userId),
      });
      resolve(orders);
      // console.log(orders, "::::::::::::;");
    });
  },

  getUsercoupen:(user)=>{
    return new Promise(async(resolve,reject)=>{
      let coupenList=await db.userCoupon.find({
        userId: ObjectId(user)});
      resolve(coupenList)
      console.log(coupenList,"this is the coupen listtttttttttttttt");
    })
      

  },

  

    coupenValidate: (user, code,amount) => {
     
      return new Promise(async(resolve,reject)=>{
        let result= await db.userCoupon.find({ userId: user, code: code });
        console.log(result)
        const moment = require('moment')
        const currentDate = moment();
       
        const specifiedDate = moment(result[0].exp, 'DD/M/YYYY, h:mm:ss a');
        if(!result){
          resolve({
            status:false,
            Message:"Invalid coupon"
          })
        }
        if(result[0].used){
          resolve({
            status:false,
            Message:"Coupon is already used"
          })
        } else if (currentDate.isAfter(specifiedDate)){
          resolve({
            status:false,
            Message:"Coupon is expired"
          })
        } else {

          
          
          const discountPercentage = result[0]?.discount
          const total = amount[0]?.totalRevenue;
          const discountPrice = (total/100)*discountPercentage
          const priceAfterDiscount = total-discountPrice
          resolve({
            status:true,
            total,
            discountPrice,
            priceAfterDiscount,
            Message:"Coupon applied successffully....!"
          })

          
        };
      })
    },

  getUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userDetails = await db.user.findOne({ _id: ObjectId(userId) });
      resolve(userDetails);
    });
  },

  validCoupens:(userId)=>{

    return new Promise(async(resolve,reject)=>{
      let validCoupens=await db.userCoupon.find({userId:userId})
      resolve(validCoupens)
    })
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.order.find({ _id: ObjectId(orderId) });
      resolve(orders);
    });
  },

  // CancelOrderItem:(orderId)=>{
  //   return new Promise(async(resolve,reject)=>{
  //     let status=await db.order.updateOne({_id})
  //   })
  // },

  CancelOrderItem: async (orderId, orderStatus) => {
    try {
      const updatedOrder = await db.order.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: orderStatus } },
        { new: true }
      );

      if (!updatedOrder) {
        throw new Error("Order not found");
      }
      console.log("Order cancelled successfully");

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  getOneProduct: async (Id) => {
    try {
      const productDetails = await db.products.findOne({
        _id: Id,
      });
      return productDetails;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
};
