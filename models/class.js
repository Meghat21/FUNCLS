const mongoose=require('mongoose');

const classSchema=new mongoose.Schema({
  className:{
    type:String,
    required:true
  },
  startTime:{
    type:String,
    required:true,
  },
  endTime:{
    type:String,
    required:true
  },
  uuid:{
    type:String,
    required:true
  },
  host_email:{
    type:String,
    required:true
  },
  host_id:{
    type:String,
    required:true
  },
  url:{
    type:String,
    required:true
  }
},{timestamps:true});

const Class=mongoose.model('CLass',classSchema);

module.exports=Class;