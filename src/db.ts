import mongoose from "mongoose";
let userSchema = new mongoose.Schema({
     fullName: {
          type:String,
          unique:true
     },
     email:{
          type:String,
          unique:true,
     },
     company:{
          type:String
     },
     phoneNumber:{
          type:String,
          unique:true
     },
     updateUser:{
          type:Boolean
     },
     sentCopy:{
          type:Boolean
     }
})
let User = mongoose.model('user',userSchema)
export default User