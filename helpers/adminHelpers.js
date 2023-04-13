const { response } = require('express')
const db= require('../model/connection')



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

    

    
}