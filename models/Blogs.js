const mongoose = require("mongoose");
const {Schema} = mongoose;

const blogSchema = new Schema({
    blogImage:{
        type:String,
        required:true
    },
    blogTitle:{
        type:String,
        required:true
    },
    blogDescription:{
        type:String,
        required:true
    },
    blogType:{
        type:String,
        enum:["all","blogs","articles","webinars","updates"],
        default:"all"

    }
});

module.exports = mongoose.model("Blog",blogSchema);