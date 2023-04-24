const { response } = require('express')
const db= require('../model/connection')
const { ObjectId } = require('mongodb')



module.exports={ 

    listUsers:()=>{
        let userData=[]
        return new Promise(async(resolve,reject)=>{
            await db.user.find().exec().then((result)=>{
                userData= result
                
            })
            console.log(userData);
            resolve(userData)
        })
    },

    //block and unblock users
    blockUser:(userId)=>{
        console.log(userId)
        return new Promise(async(resolve,reject)=>{
        await db.user.updateOne({_id:userId},{$set:{blocked:true}}).then((data)=>{
            console.log('user blocked success');
            resolve()
        })
        })
    },

    UnblockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
        await db.user.updateOne({_id:userId},{$set:{blocked:false}}).then((data)=>{
            console.log('user unblocked success');
            resolve()
        })
        })
    },







    //for finding all catagories available and making them to passable object

    findAllcategories:()=>{
        return new Promise (async(resolve,reject)=>{
            await db.category.find().exec().then((response)=>{
                resolve(response)
            })

        })
    },
   
    
    postAddProduct: (userData,filename)=>{

        return new Promise((resolve,reject)=>{
            uploadedImage= new db.products({
                Productname:userData.name,
                ProductDescription:userData.description,
                Quantity:userData.quantity,
                Image:filename,
                category:userData.category,
                Price:userData.Price
            })
            uploadedImage.save().then((data)=>{
                resolve(data)
            })
        })
    },

    getViewProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            await db.products.find().exec().then((response)=>{
                resolve(response)
            })

        })
    },


    

    
    
      

    addCategory: (data) => {
        console.log(data);
        return new Promise(async (resolve, reject) => {
          let existingCat = await db.category.findOne({ CategoryName: { $regex: new RegExp(data.category, 'i') } })
          if (existingCat) {
            resolve(existingCat);
            return;
          }
          const catData = new db.category({ CategoryName: data.category });
          console.log(catData);
          await catData.save().then((data) => {
            resolve(data);
          });
        });
      },
      
    
    
      


    viewAddCategory: ()=>{
        return new Promise(async(resolve,reject)=>{
            await db.category.find().exec().then((response)=>{
                resolve(response)
            })
        }) 
    },

    delCategory:(delete_id)=>
    {
        console.log(delete_id);
        return new Promise(async(resolve, reject) => {
          await db.category.deleteOne({_id:delete_id}).then((response)=>
          {          
            resolve(response)
          })
            
        })
    },

    editProduct: (productId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.products.findOne({_id:productId}).exec().then((response)=>{
                resolve(response)
            })
        })
    },
    postEditProduct:(productId,editedData,filename)=>{
        return new Promise(async(resolve,reject)=>{
            await db.products.updateOne({_id:productId},{$set:{
            Productname:editedData.name,
            ProductDescription:editedData.description,
            Quantity:editedData.quantity,
            Price:editedData.price,
            category:editedData.category,
            Image:filename
           }}) .then((response)=>{
            console.log(response);

            resolve(response)
           }) 
        })
    },
    deleteProduct:(productId)=>{
        return new Promise (async(resolve,reject)=>{
            await db.products.deleteOne({_id:productId}).then((response)=>{
                resolve (response)
            })
        })
    },
   
    
    //edit category first
   findOneCategory :(categoryId)=>{
    return new Promise(async(resolve,reject)=>{
            await db.category.findOne({_id:categoryId}).then((response)=>{
             resolve(response)
           })
       })
    },

 //second
    editPostTheCategory:(categoryId,data)=>{
       return new Promise(async(resolve,reject)=>{
           await db.category.updateOne({_id:categoryId},{$set:{CategoryName:data.categoryname}}).then((response)=>{
             resolve(response)
           })
       })
    },

    orderPage: () => {
        return new Promise(async (resolve, reject) => {
    
          await db.order.aggregate([


            [
                {
                  $unwind: {
                    path:'$products', 
                    includeArrayIndex: 'string'
                  }
                }, {
                  $project: {
                    _id:1,
                    deliveryDetails: 1, 
                    userId: 1, 
                    paymentMethod: 1, 
                    products: 1, 
                    status: 1, 
                    totalAmount: 1, 
                    date: 1
                  }
                }
              ]
            // {
            //   $unwind: '$orders'
            // },
            // {
            //   $sort: { 'orders: createdAt': -1 }
            // }
          ]).then((response) => {
            console.log(response,"this is response of admin order list");
            resolve(response)
    
          })
        })
    
      },

      orderDetails: (orderId) => {
        console.log(orderId,"------------------------");
        return new Promise(async (resolve, reject) => {
    
          let order = await db.order.findOne({ _id: orderId })
          
          console.log(order + '----------------------------------------------------------------');
          resolve(order)
        })
    
      },
//jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
      changeOrderStatus: (orderId, data) => {
        console.log(orderId,data,">>>>>>>>>>>>>>>>>>>>>>>");
        return new Promise(async (resolve, reject) => {
        //   let orders = await db.order.findOne({ _id: orderId }, { 'orders.$': 1 })
    
          let users = await db.order.findOneAndUpdate(
            { _id: orderId },
            {
              $set: {
                status: data,
    
              }
            },
            {new:true}
          )
          console.log("status updated successfully.........");
          resolve(response)
        })
    
      },

      removeCoupon:(coupId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.coupon.deleteOne({_id:coupId}).then((response)=>{
                resolve(response)
                // console.log(response,"opopopopo");
            })
        })
            
      },

      addNewCoupon:(data)=>{

        return new Promise(async(resolve,reject)=>{
            Newdata = new db.coupon({
             couponName: data.code,
             discount:data.discount,
             priceLimit: data.priceLimit,
             description: data.description,
             expiry: data.date,
             })
    
            await Newdata.save().then((Newdata)=>{
          console.log(Newdata,"iiiiiiiiiiiiiiiiiiiiii");
    
          
                 resolve(Newdata)
             })
          
         })
      },

      getSalesData:(req,res)=>{
        return new Promise(async(resolve,reject)=>{
          await  db.order.aggregate([
                    {
                      $match: {
                        status: 'Delivered'
                      }
                    },
                   
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "result"
                          }
                      },
                     {
                       $unwind: {
                            path: "$result",
                            includeArrayIndex: 'string'
                                }
                     },
                    // {
                    //   $project: {
                    //     deliveryDetails: 0, 
                    //     products: 0
                    //   }
                    // }
                  ]).then((response)=>{
                    
                        console.log(response,"iiiiiiiiiiiiiiiiii");
                        resolve(response)
                       
                
                     
                  })
          
            
        })
      },

      getTotalAmount: (date) => {
        let start = new Date(date.startdate);
        let end = new Date(date.enddate);
        return new Promise(async (resolve, reject) => {
    
    
          await db.order.aggregate([
    
            
            {
              $match: {
                $and: [
                  { "status": "Delivered" },
                  { "date": { $gte: start, $lte: end } }
    
                ]
              }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "result"
                  }
              },
             {
               $unwind: {
                    path: "$result",
                    includeArrayIndex: 'string'
                        }
             },
            // {
            //   $project: {
            //     deliveryDetails: 0, 
            //     products: 0
            //   }
            // }
          ]).then((response)=>{
    
    
            resolve(response,"rrrrrrrrrrrrrrrrr")
            // console.log(total[0].total[0], '------------------------------');
    
    
          })
    
        })
    
      },

      searchItem:(item)=>{
            return new Promise((resolve,reject)=>{
                db.products.find({$or:[{
                    Productname:item },{
                        category:item}]}).then((response)=>{
                            resolve(response)
                            // console.log(response,"riiiiioooooooooooooo");
                        })
            })
      }

    

    
}