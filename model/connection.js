var mongoose = require("mongoose");
const db =mongoose .connect("mongodb://0.0.0.0:27017/ecommerce", {
        useNewUrlParser: true,
        useUnifiedTopology: true })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));

const {ObjectID}=require('bson')
 const {ObjectId}=require("mongodb")

 const userschema= new mongoose.Schema({

    username:{
        type:String,
        required: true,
        unique:true
    },
    Password:{
        type:String,
        required:true,
    
    },

    address:[{
      name:{
        type:String,
        required:true
      },
      firstLine:{
        type:String,
        required:true
      },
      secondLine:{
        type:String,
        required:true
      },
      city:{
        type:String,
        required:true
      },
      state:{
        type:String,
        required:true
      },
      pincode:{
        type:String,
        required:true
      },
      contactNumber:{
        type:String,
        required:true
      }

    }],
    email:{
        type:String,
        required:true,
        unique:true,
    },
    
    access:{
        type:Boolean,default:false

    },
    CreatedAt:{
        type:Date,
        default:Date.now,
    }, 
    phoneNumber:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    blocked:{
      type:Boolean,default:false
  }
   



 })
 const productSchema=new mongoose.Schema({
    Productname:{
      type:String
    },
    ProductDescription:{
      type:String
    },
    Quantity:{
      type:Number
    },
    Image:{
      type:Array,
     
    },
    Price:{
    type:Number
    },
    category:{
      type:String
    },
   
  
    })


//category

 const categorySchema= new mongoose.Schema({
    CategoryName:{
        type:String
    }
 })

 //cart

const cartSchema=new mongoose.Schema({
  userid:mongoose.SchemaTypes.ObjectId,
  products:[]
})

//address

const addressSchema=new mongoose.Schema({
  name:{
   type: String,
   required: true
  },
  contactNumber:{
   type: String,
   required: true
  },
  firstLine:{
   type: String
  },
  secondLine:{
    type: String
  },
  city:{
   type: String,
   required: true
  },
  state:{
    type: String,
    required: true
  },
  pincode:{
      type: Number
  },
  createdAt:{
   type: Date,
   default: Date.now
  },
  modifiedAt:{
   type: Date,
   default: Date.now
  }
})


//order

const orderSchema = new mongoose.Schema({

  deliveryDetails:{
    address: {
      type: String,

    },
    mobile: {
      type: String,

    },
    pincode: {
      type: String,

    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId


  },
  paymentMethod: {
    type: String,

  },
  products: {
    type: Array,

  },
  status: {
    type: String

  },
  totalAmount: {
    type: String
  },
  // discount: {
  //   type: String
  // },
  date: {
    type: Date

  },
  cartId:{
    type: mongoose.Schema.Types.ObjectId
  }
});

//wishlist

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
  wishitems: [{
    productId: { type: mongoose.Schema.Types.ObjectId },
  }],
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// coupen

// const couponSchema = new mongoose.Schema({
//   couponName: String,
//   expiry: {
//     type: Date,
//     default: new Date(),
//   },
//   minPurchase: Number,
//   discountPercentage: Number,
//   maxDiscountValue: Number,
//   couponApplied: {
//     type: String,
//     default: false
//   },
//   isActive: {
//     type: Boolean,
//     default: false
//   },
//   description: String,
//   createdAt: {
//     type: Date,
//     default: new Date(),
//   },
// });

const couponSchema = new mongoose.Schema({
  "couponName": "string", // The name of the coupon
  "discount":"number",
  "priceLimit": "number", // The minimum purchase amount required to use the coupon
  "description": "string", // A description of the coupon
  "expiry": "string", // The date the coupon expires in YYYY-MM-DD format
})




const userCoupon =new mongoose.Schema({
  couponId:{
    type:mongoose.Schema.Types.ObjectId
  } ,
  userId:{
    type:String
  } ,
  couponCode:{
    type:String
  },

  discount:{
    type:Number
  },

  used:{
    type:Boolean
  },
  code:{
    type:String
  },
  createDate :{
    type:String,
    
  }, 
  exp:{
    type:String
    
  }
  
})





 module.exports={
    user : mongoose.model('user',userschema),
    category : mongoose.model('category',categorySchema),
    products : mongoose.model('products',productSchema),
    cart : mongoose.model('cart',cartSchema),
    address : mongoose.model('address',addressSchema),
    order:mongoose.model('order',orderSchema),
    wishlist:mongoose.model('wishlist',wishlistSchema),
    coupon:mongoose.model('coupon',couponSchema),
    userCoupon:mongoose.model('userCoupon',userCoupon)
 }