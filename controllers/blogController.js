const Blogs = require("../models/Blogs");

//getBlogs - function to get all the blogs from the database
exports.getBlogs = async (req, res) => {
  try {
    //finding all the blogs in database and returning it
    const doc = await Blogs.find();
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false });
    console.log(error);
  }
};

//createBlog - function to create blog and store it in the database
exports.createBlog = (req, res) => {
  try {
    const image = req.files.img;
    console.log("this is the image uploaded", req.files.img);

    // using mv method of express-fileupload to move the uploaded image to the specific folder
    image.mv("uploads/" + image.name, async (error) => {
      if (error) {
        console.log("error uploading image file", error);
        return res.status(500).json({ success: false });
      }
      console.log("file uploaded successfully");

      console.log("this is the blog body data", req.body.blogData);

      const blogData = req.body.blogData;

      // creating a new document in the database
      const doc = await Blogs.create({...blogData,blogImage:image.tempFilePath});

      //below shown is the temporary document stored in database with filepath
      // const doc = await Blogs.create({
      //   blogTitle: "yash",
      //   blogDescription: "This is about me",
      //   blogType: "articles",
      //   blogImage: image.tempFilePath,
      // });

      // console.log("doc created in the db",doc);
      res.status(200).json({ success: true });
    });
    // console.log("file::::::",req.files.img);
  } catch (error) {
    res.status(500).json({ success: false });
    console.log(error);
  }
};

//updateBlog - function to update the blog in the database
exports.updateBlog = async (req, res) => {
  try {
    const image = req.files.img;
    console.log("this is the image uploaded", req.files.img);

    // using mv method of express-fileupload to move the uploaded image to the specific folder
    image.mv("uploads/" + image.name, async (error) => {
      if (error) {
        console.log("error uploading image file", error);
        return res.status(500).json({ success: false });
      }
      console.log("file uploaded successfully");

      console.log("this is the blog body data", req.body.blogData);

      const blogID = req.params.id;

      console.log("this is blogID", blogID);

    //this is a temporary blog data for updation
    const blogData = {
      blogTitle: "yash",
      blogDescription: "This is about saksham",
      blogType: "articles",
      blogImage: "image.tempFilePath",
    };

    // const blogData = req.body.blogData;



    //searching for the blog document in the database
    const doc = await Blogs.findByIdAndUpdate({ _id: blogID }, blogData, {
      new: true,
    });
    console.log("this is the blog document",doc);

    res.status(200).json({ success: true });

    });
    
    
  } catch (error) {
    res.status(500).json({ success: false });
    console.log(error);
  }
};

//deleteBlog - function to delete the blog in the database
exports.deleteBlog = async (req, res) => {
  try {
    const blogID = req.params.id;

    const doc = await Blogs.findByIdAndDelete({_id:blogID});

    console.log("this is the deleted document",doc);
    res.status(200).json({success:true});
  } catch (error) {
    res.status(500).json({ success: false });
    console.log(error);
  }
};
