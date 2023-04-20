const adminHelper = require('../helpers/adminHelpers')
const db =require('../model/connection')
const multer = require('multer')


const adminCredential={
    name:'alee',
    email:'admin@gmail.com',
    password:'123'
   }
   let adminStatus

module.exports={

    displayDashboard: (req,res)=>{
        let check= req.session.admin
        if(adminStatus){
            res.render('admin/admin-dash',{layout:"adminLayout",check,adminStatus})
        }else{
            res.redirect('/admin/login')
        }
    },

    getAdminLogin:(req, res)=> {
        if(req.session.adminloggedIn){
          
          console.log(adminloggedIn,"shaksjaksjaslkjaska")
          res.render("admin/admin-dash",{layout:"adminLayout",adminStatus})
        }
        else{
          let loginerr= req.session.adminloginErr
          res.render("admin/login", { layout: "adminLayout", adminStatus,loginerr});
          req.session.adminloginErr=false
        }
      },



        postAdminLogin: (req,res)=>{
        if(req.body.email==adminCredential.email && req.body.password==adminCredential.password){
            req.session.admin=adminCredential
           req.session.adminIn=true
           adminStatus=req.session.adminIn
           console.log(adminStatus,",poiuytrew")
           
           res.redirect('/admin')
        }
        
          else{
            req.session.adminloginErr=true
            res.redirect('/admin/login')
          }
         },


   


         adminLogout:(req,res)=>{
           req.session.admin=null
           adminStatus=false
           req.session.adminIn=false
           res.render('admin/login',{ layout: "adminLayout", adminStatus})
         },

         getUserlist:(req,res)=>{
            adminHelper.listUsers().then((user)=>{
               res.render('admin/view-users',{layout:"adminLayout",user,adminStatus})
            })
         },

         addProducts : (req, res) =>{ 
          adminHelper.findAllcategories().then((availCategory)=>{
            res.render("admin/add-product", { layout: "adminLayout",adminStatus,availCategory})
          })

          
        },


        postProducts:(req,res)=>{
          console.log(req.body);
         const { quantity } = req.body
         
          adminHelper.postAddProduct(req.body, req.file.filename).then((response)=>{
            res.redirect('/admin/view-product')
        })

         
      },


        viewProducts:(req,res)=>{
          adminHelper.getViewProducts().then((response)=>{
            res.render("admin/view-product",{ layout: "adminLayout" ,response,adminStatus})
          })
        },

     

        

        getCategory: (req,res)=>{
          adminHelper.viewAddCategory().then((response)=>{
            let viewCategory = response
            res.render('admin/add-category',{layout:"adminLayout",viewCategory,adminStatus})
          })
        },


        postCategory: (req,res)=>{
          adminHelper.addCategory(req.body).then((response)=>{
             res.redirect('/admin/add-category')
          })

        },


        deleteCategory:(req,res)=>{
          adminHelper.delCategory(req.params.id).then((response)=>{
            res.redirect('/admin/add-category')
          })
        },


        //edit product 


        editProduct:(req,res) =>{

      adminHelper.viewAddCategory().then((response)=>{
    
        var procategory=response
          adminHelper.editProduct(req.params.id).then((response)=>{
          editproduct=response
         
          
          console.log(editproduct);
          console.log(procategory);
        res.render('admin/edit-viewproduct',{ layout: "adminLayout" ,editproduct,procategory,adminStatus});
    
      })})
      
      
    
    },
    
    //posteditaddproduct
    
    
    post_EditProduct:(req,res) =>{
      console.log(req.body);
      console.log(req.file);
      
      adminHelper.postEditProduct(req.params.id, req.body,req?.file?.filename).then((response)=>{
        console.log(response);
        res.redirect('/admin/view-product')
      })
    
      
    },

     //delete view product 
    
    
     deleteTheProduct:(req,res) =>{
      const {productId} = req.body
      console.log(productId)
      adminHelper.deleteProduct(productId).then((response)=>{
        res.status(200).json({Message:"Product deleted successfully",status:true})
      })
      
    },


    // block user

    blockTheUser: (req,res)=>{
      adminHelper.blockUser(req.params.id).then((response)=>{
        res.redirect('/admin/view-users')
      })
    },

    unblockTheUser: (req,res)=>{
      adminHelper.UnblockUser(req.params.id).then((response)=>{
        res.redirect('/admin/view-users')
      })
    },
   
//first
    editTheCategory:(req,res) =>{
      adminHelper.findOneCategory(req.params.id).then((response)=>{
        let editCat=response
        res.render("admin/edit-category",{layout : "adminLayout",editCat,adminStatus})
      })
  },
    

  //second 
    postEditCategory :(req,res) =>{
      adminHelper.editPostTheCategory(req.params.id,req.body).then((response)=>{
        res.redirect('/admin/add-category')
      })
    },

    
      

        
    //     userhelpers.viewUserOrders(userId).then((response) => {
    //       // console.log(response, "this is new response..........");
    //       res.render("user/orders", { loginheader: true, response,userName:user });
    //     });
    getOrderList: (req, res) => {


      adminHelper.orderPage().then((response) => {
        const getDate = (date) => {
          let orderDate = new Date(date);
          let day = orderDate.getDate();
          let month = orderDate.getMonth() + 1;
          let year = orderDate.getFullYear();
          let hours = date.getHours();
          let minutes = date.getMinutes();
          let seconds = date.getSeconds();
          return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
            } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(seconds)}`;
        };
  
        // res.render('admin/order-list', { layout: 'adminLayout', adminStatus, response, getDate })
        res.render('admin/orders-list',{layout:"adminLayout",adminStatus,response,getDate})
      })
    },

    getOrderDetails: (req, res) => {
      console.log(req.query.orderid,"this is orderId");
      adminHelper.orderDetails(req.query.orderid).then((order) => {
        console.log(order, 'orderrrrrrrrrrrrrrrrrrrr');
        const getDate = (date) => {
          let orderDate = new Date(date);
          let day = orderDate.getDate();
          let month = orderDate.getMonth() + 1;
          let year = orderDate.getFullYear();
          let hours = date.getHours();
          let minutes = date.getMinutes();
          let seconds = date.getSeconds();
          return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
            } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(seconds)}`;
        };
  
        let products = order.products
        console.log(products,"jjjjjjjjjjjjjjjjj");
        let total = order.totalAmount
        res.render('admin/order-details', { layout: 'adminLayout', adminStatus, order, total,products,  getDate })
      
      })
  
    },

    postOrderDetails: (req, res) => {
      console.log(req.query.orderId,"this is postorder details orderid");
      console.log(req.body,"this is req.body in post order details");
      adminHelper.changeOrderStatus(req.query.orderId, req.body.status).then((response) => {
        res.redirect('/admin/orders-list')
      })
  
    },

    getDiscount:(req,res)=>{
      
      return new Promise(async(resolve,reject)=>{
        await db.coupon.find().exec().then((response)=>{
            resolve(response)
            console.log(response,"jjjjjjjjjjjjjjjjj");
            // console.log("hiiiiiiyiiiiiiiiiii");
            res.render('admin/view-discount',{layout:'adminLayout',adminStatus:true,response})
          })
    })

     
    },

    addNewCoupon: (req,res)=>{
      // console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
     
      let data=req.body;
     adminHelper.addNewCoupon(data).then(()=>{
      res.redirect('/admin/view-discount')
     })

    
  },

  getSalesreport:(req,res)=>{
    //date,orderid,username,priceTotal,payment method
    adminHelper.getSalesData().then((response)=>{
      console.log(response,"the sales reportttttttttttttttttttttttttt");
      // let username=response[0].user[0].username;
      console.log(response[0].result.username,"qqqqqqqqqqqqqqqqqqqqqqqq");
      res.render('admin/sales-report',{layout:'adminLayout',adminStatus:true,response})
    })
    
  }



    
      
  
}



    
