const { response } = require("../app");
const adminHelper = require("../helpers/adminHelpers");
const userhelpers = require("../helpers/userhelpers");
const db = require("../model/connection");
const multer = require("multer");

const adminCredential = {
  name: "alee",
  email: "admin@gmail.com",
  password: "123",
};
let adminStatus;

module.exports = {
  displayDashboard: (req, res) => {
    let check = req.session.admin;
    if (adminStatus) {
      res.render("admin/admin-dash", {
        layout: "adminLayout",
        check,
        adminStatus,
      });
    } else {
      res.redirect("/admin/login");
    }
  },

  getAdminLogin: (req, res) => {
    if (req.session.adminloggedIn) {
      console.log(adminloggedIn, "shaksjaksjaslkjaska");
      res.render("admin/admin-dash", { layout: "adminLayout", adminStatus });
    } else {
      let loginerr = req.session.adminloginErr;
      res.render("admin/login", {
        layout: "adminLayout",
        adminStatus,
        loginerr,
      });
      req.session.adminloginErr = false;
    }
  },

  postAdminLogin: (req, res) => {
    if (
      req.body.email == adminCredential.email &&
      req.body.password == adminCredential.password
    ) {
      req.session.admin = adminCredential;
      req.session.adminIn = true;
      adminStatus = req.session.adminIn;
      console.log(adminStatus, ",poiuytrew");

      res.redirect("/admin");
    } else {
      req.session.adminloginErr = true;
      res.redirect("/admin/login");
    }
  },

  adminLogout: (req, res) => {
    req.session.admin = null;
    adminStatus = false;
    req.session.adminIn = false;
    res.render("admin/login", { layout: "adminLayout", adminStatus });
  },

  getUserlist: (req, res) => {
    adminHelper.listUsers().then((user) => {
      res.render("admin/view-users", {
        layout: "adminLayout",
        user,
        adminStatus,
      });
    });
  },

  addProducts: (req, res) => {
    adminHelper.findAllcategories().then((availCategory) => {
      res.render("admin/add-product", {
        layout: "adminLayout",
        adminStatus,
        availCategory,
      });
    });
  },

  postProducts: (req, res) => {
    // console.log(req.body);
    console.log(req.files, "kkkkkkkkhhhh");

    let image = req.files.map((files) => files.filename);
    const { quantity } = req.body;

    adminHelper.postAddProduct(req.body, image).then((response) => {
      res.redirect("/admin/view-product");
    });
  },


  // getViewproduct: async (req, res) => {
  //   const pageNum = req.query.page;
  //   const currentPage = pageNum;
  //   const perPage = 10;
  //   const documentCount = await userhelpers.documentCount();
  //   let pages2 = Math.ceil(parseInt(documentCount) / perPage);
  //   adminHelper.ViewProduct(pageNum, perPage).then((response) => {
  //     res.render("admin/view-product", {
  //       layout: "adminLayout",
  //       adminStatus,
  //       response,
  //       currentPage,
  //       documentCount,
  //       pages2
  //     });
  //   });
  // },
//nowwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
  viewProducts: async(req, res) => {
    const pageNum = req.query.page;
    console.log(pageNum,"`````````````````````````````````````````````");
    const currentPage = pageNum;
    const perPage = 5;
    const documentCount = await userhelpers.documentCount();
    console.log(documentCount,"///////////////////////");
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    adminHelper.getViewProducts(pageNum, perPage).then((response) => {
      res.render("admin/view-product", {
        layout: "adminLayout",documentCount,
        response,pages2,currentPage,
        adminStatus,
      });
    });
  },

  getCategory: (req, res) => {
    adminHelper.viewAddCategory().then((response) => {
      let viewCategory = response;
      res.render("admin/add-category", {
        layout: "adminLayout",
        viewCategory,
        adminStatus,
      });
    });
  },

  postCategory: (req, res) => {
    adminHelper.addCategory(req.body).then((response) => {
      res.redirect("/admin/add-category");
    });
  },

  deleteCategory: (req, res) => {
    adminHelper.delCategory(req.params.id).then((response) => {
      res.redirect("/admin/add-category");
    });
  },

  //edit product

  editProduct: (req, res) => {
    adminHelper.viewAddCategory().then((response) => {
      var procategory = response;
      adminHelper.editProduct(req.params.id).then((response) => {
        editproduct = response;

        console.log(editproduct);
        console.log(procategory);
        res.render("admin/edit-viewproduct", {
          layout: "adminLayout",
          editproduct,
          procategory,
          adminStatus,
        });
      });
    });
  },

  //posteditaddproduct

  post_EditProduct: async (req, res) => {
    console.log(req.body);
    // console.log(req.params.id, "77777777");

    let product = await adminHelper.editProduct(req.params.id);
    //  console.log(product,"900000000000");
    let oldImageArray = product.Image;
    //  console.log(oldImageArray,"oooo");
    editedImageArray = [];

    if (req.files.image1) {
      editedImageArray[0] = req.files.image1[0].filename;
    } else {
      editedImageArray[0] = oldImageArray[0];
    }

    if (req.files.image2) {
      editedImageArray[1] =  req.files.image2[0].filename;
    } else {
      editedImageArray[1] = oldImageArray[1];
    }

    if (req.files.image3) {
      editedImageArray[2] =  req.files.image3[0].filename;
    } else {
      editedImageArray[2] = oldImageArray[2];
    }

    if (req.files.image4) {
      editedImageArray[3] = req.files.image4[0].filename;
    } else {
      editedImageArray[3] = oldImageArray[3];
    }

    console.log(editedImageArray,"this is edited.............");

    adminHelper
      .postEditProduct(req.params.id, req.body,editedImageArray )
      .then((response) => {
        console.log(response);
        res.redirect("/admin/view-product");
      });
  },

  //delete view product

  deleteTheProduct: (req, res) => {
    const { productId } = req.body;
    console.log(productId);
    adminHelper.deleteProduct(productId).then((response) => {
      res
        .status(200)
        .json({ Message: "Product deleted successfully", status: true });
    });
  },

  // block user

  blockTheUser: (req, res) => {
    adminHelper.blockUser(req.params.id).then((response) => {
      res.redirect("/admin/view-users");
    });
  },

  unblockTheUser: (req, res) => {
    adminHelper.UnblockUser(req.params.id).then((response) => {
      res.redirect("/admin/view-users");
    });
  },

  //first
  editTheCategory: (req, res) => {
    adminHelper.findOneCategory(req.params.id).then((response) => {
      let editCat = response;
      res.render("admin/edit-category", {
        layout: "adminLayout",
        editCat,
        adminStatus,
      });
    });
  },

  //second
  postEditCategory: (req, res) => {
    adminHelper
      .editPostTheCategory(req.params.id, req.body)
      .then((response) => {
        res.redirect("/admin/add-category");
      });
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
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
          isNaN(year) ? "0000" : year
        } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
          seconds
        )}`;
      };

      // res.render('admin/order-list', { layout: 'adminLayout', adminStatus, response, getDate })
      res.render("admin/orders-list", {
        layout: "adminLayout",
        adminStatus,
        response,
        getDate,
      });
    });
  },

  getOrderDetails: (req, res) => {
    console.log(req.query.orderid, "this is orderId");
    adminHelper.orderDetails(req.query.orderid).then((order) => {
      console.log(order, "orderrrrrrrrrrrrrrrrrrrr");
      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
          isNaN(year) ? "0000" : year
        } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
          seconds
        )}`;
      };

      let products = order.products;
      console.log(products, "jjjjjjjjjjjjjjjjj");
      let total = order.totalAmount;
      res.render("admin/order-details", {
        layout: "adminLayout",
        adminStatus,
        order,
        total,
        products,
        getDate,
      });
    });
  },

  postOrderDetails: (req, res) => {
    console.log(req.query.orderId, "this is postorder details orderid");
    console.log(req.body, "this is req.body in post order details");
    adminHelper
      .changeOrderStatus(req.query.orderId, req.body.status)
      .then((response) => {
        res.redirect("/admin/orders-list");
      });
  },

  getDiscount: (req, res) => {
    return new Promise(async (resolve, reject) => {
      await db.coupon
        .find()
        .exec()
        .then((response) => {
          resolve(response);
          console.log(response, "jjjjjjjjjjjjjjjjj");
          // console.log("hiiiiiiyiiiiiiiiiii");
          res.render("admin/view-discount", {
            layout: "adminLayout",
            adminStatus: true,
            response,
          });
        });
    });
  },

  removeCoupon: (req, res) => {
    console.log(req.body.coupId, "iiiiiiiiiii");
    adminHelper.removeCoupon(req.body.coupId).then((response) => {
      res.json({ status: true });
    });
  },

  addNewCoupon: (req, res) => {
    // console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");

    let data = req.body;
    adminHelper.addNewCoupon(data).then(() => {
      res.redirect("/admin/view-discount");
    });
  },

  getSalesreport: (req, res) => {

    //date,orderid,username,priceTotal,payment method
    adminHelper.getSalesData().then((response) => {
      // let username=response[0].user[0].username;
      
      res.render("admin/sales-report", {
        layout: "adminLayout",
        adminStatus: true,
        response,
      });
    });
  },

  salesReport: async (req, res) => {
    console.log(req.body, "saleeeeeeeeeeeeeeeeeeeeeeeees");

    await adminHelper.getTotalAmount(req.body).then((response) => {
      res.render("admin/sales-report", {
        layout: "adminLayout",
        adminStatus,
        response,
      });
    });
    // console.log(total,"uuuuuuuuuuuuuuuuuuuuuu");

    // adminHelper.postReport(req.body).then((orderdata) => {

    //   orderdata.forEach(orders => { Details.push(orders.orders) })

    // })
  },
//wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
  searchItem: async (req, res) => {
    const pageNum = req.query.page;
    // console.log(pageNum,"`````````````````````````````````````````````");
    const currentPage = pageNum;
    const perPage = 5;
    const documentCount = await userhelpers.documentCount();
    console.log(documentCount,"///////////////////////");
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    
    await adminHelper.searchItem(req.body.searchItem).then((response) => {
      res.render("admin/view-product", {
        layout: "adminLayout",currentPage,
        adminStatus,documentCount,
        response,pages2,
      });
    });
  },

  searchItemCoupon: async (req, res) => {
    await adminHelper.searchItemCoupon(req.body.searchItem).then((response) => {
      res.render("admin/view-discount", {
        layout: "adminLayout",
        adminStatus: true,
        response,
      });
    });
  },
};
