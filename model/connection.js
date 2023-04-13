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
      type:String,
     
    },
    Price:{
    type:Number
    },
    category:{
      type:String
    },
   
  
    })
  
 const categorySchema= new mongoose.Schema({
    CategoryName:{
        type:String
    }
 })


const cartSchema=new mongoose.Schema({
  userid:mongoose.SchemaTypes.ObjectId,
  products:[]
})


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

 module.exports={
    user : mongoose.model('user',userschema),
    category : mongoose.model('category',categorySchema),
    products : mongoose.model('products',productSchema),
    cart : mongoose.model('cart',cartSchema),
    address : mongoose.model('address',addressSchema),
    order:mongoose.model('order',orderSchema),
 }