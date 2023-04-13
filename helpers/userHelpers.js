const bcrypt = require("bcrypt");
const { isObjectIdOrHexString } = require("mongoose");
const { user, cart } = require("../model/connection");
const db = require("../model/connection");
const ObjectId = require("mongodb").ObjectId;
const mongoose = require("mongoose");

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
        console.log(total, ",,,,,,,,,,,,,,,,,,,,,,,,,,,,");

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
      resolve(addressDetails);
    });
  },

  getCartProductList: (userId) => {
    console.log(userId, "............>");
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

  placeOrder: (order, carts, total, userId) => {
    // console.log(total,"this is total..........");
    console.log(userId, "//////.......///");
    return new Promise((resolve, reject) => {
      console.log(order, "this is order");
      console.log(order.flexRadioDefault, ":::LLLLLLLLLL:::::::::");


      // let address= db.user.findOne({_id:userId})
      // console.log(".................>",address,"<...............");

      // const userId = userId; // replace this with the actual user id
      const cartId = order.flexRadioDefault; // replace this with your actual cart id
        //;;;;;;;;;;;;;;;;;;;;;;;;
      db.user.findById(userId)
        .select("address")
        .then((user) => {
          var cartAddress = user.address.find(
            (a) => a._id.toString() === cartId
          );
        //   if (cartAddress) {
        //     // the cart is found within the user's addresses array
        //     // you can now proceed to placing the order
        //     console.log(cartAddress,"OOOOOOOOOOOOOOOOOOOOOOO");
        //   } else {
        //     // the cart is not found within the user's addresses array
        //     // handle the error accordingly
        //     console.log("sooooooooooooooooooorry,address not found");
        //   }
        // })
        // .catch((error) => {
        //   // handle the error
        //   console.log(err);
        // });
        //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

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
  }
    )},

  //   viewUserOrders:(userId)=>{
  //     console.log(userId,"kooooooooooookkaaaelu");
  //     return new Promise(async(resolve,reject)=>{
  //       let orders=await db.order.find({userid:userId})
  //       resolve(orders)
  //       console.log(orders,"::::::::::::;");
  //   })
  // },

  viewUserOrders:(userId) => {
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

  getUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let userDetails = await db.user.findOne({ _id: ObjectId(userId) });
      resolve(userDetails);
    });
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

  CancelOrderItem:async(orderId,orderStatus)=> {

    
    try {
     
      const updatedOrder = await db.order.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: orderStatus } },
        { new: true }
      );
      
      if (!updatedOrder) {
        throw new Error('Order not found');
      }
      console.log('Order cancelled successfully');

      return true;
    } catch (error) {
      console.error(error);
      return false
    }
  },

  getOneProduct:async(Id)=>{
      try{

        const productDetails =await db.products.findOne({
          _id:Id
        })
        return productDetails
      }
      catch(error){
        console.error(error);
        return false
      }
  }
 
  
  
  
  
};
