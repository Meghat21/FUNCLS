const express = require("express");
const router = express.Router();
const classes = require("../models/class")
const requestPromise = require("request-promise");
const { protect, authorize } = require("../middleware/auth")
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Class = require("../models/class");

var bodyParser = require('body-parser')

var app = express()

app.use(bodyParser.urlencoded({
  extended: true
}));
const payload = {
  iss: process.env.API_KEY, //your API KEY
  exp: new Date().getTime() + 5000,
};
const token = jwt.sign(payload, process.env.API_SECRET); //your API SECRET HERE

//zoom getting
router.get("/api", (req, res) => {
  return res.render("createMeeting");
});
//zoom posting
router.post('/postMeeting', (req, res) => {
  email = "meghasahu2023@gmail.com"; // your zoom developer email account
  var options = {
    method: "POST",
    uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
    body: {
      topic: "Zoom Meeting Using Node JS", //meeting title
      type: 1,
      settings: {
        host_video: "true",
        participant_video: "true",
      },
    },
    auth: {
      bearer: token,
    },
    headers: {
      "User-Agent": "Zoom-api-Jwt-Request",
      "content-type": "application/json",
    },
    json: true, //Parse the JSON string in the response
  };

  requestPromise(options)
    .then(function (response) {
      console.log("response is: ", response);
      var obj = {
        className: req.body.className,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        uuid: response["uuid"],
        host_id: response["host_id"],
        url: response["join_url"],
        host_email: response["host_email"]
      };

      const classDetail = Class.create({
        className: obj['className'],
        startTime: obj['startTime'],
        endTime: obj['endTime'],
        uuid: obj['uuid'],
        url: obj['url'],
        host_email: obj['host_email'],
        host_id: obj['host_id']
      });
      if (classDetail) {
        console.log("data saved");
      } else {
        console.log("error in saving data");
      }
      res.send(JSON.stringify(obj));
      // res.send(JSON.stringify(respnse));

    })
    .catch(function (err) {
      // API call failed...
      res.status(400).json({ msg: `Internal server error-${err}` || "Internal server error" })
    });

});

router.get("/createMeeting", protect, (req, res) => {
  email = "meghasahu2023@gmail.com"; // your zoom developer email account
  var options = {
    method: "POST",
    uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
    body: {
      topic: "Zoom Meeting Using Node JS", //meeting title
      type: 1,
      settings: {
        host_video: "true",
        participant_video: "true",
      },
    },
    auth: {
      bearer: token,
    },
    headers: {
      "User-Agent": "Zoom-api-Jwt-Request",
      "content-type": "application/json",
    },
    json: true, //Parse the JSON string in the response
  };

  requestPromise(options)
    .then(function (response) {

      res.send(JSON.stringify(response));
    })
    .catch(function (err) {
      // API call failed...
      res.status(400).json({ msg: `Internal server error-${err}` || "Internal server error" })
    });
});
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params
  try {

    const existingClass = await classes.find({ _id: id })
    if (existingClass.length <= 0) {
      return res.status(400).json({ status: "FAILURE", msg: "No classes found" })
    }

    classes.deleteOne({ _id: id }).then(() => {
      res.status(200).json({ status: "SUCCESS", msg: "Deleted successfully" })
    }).catch((err) => {
      res.status(400).json({ status: "FAILURE", msg: `Internal server error-${err}` || "Internal server error" })
    })
  }
  catch (err) {
    res.status(200).json({ status: "FAILURE", msg: `Internal server error-${err}` || "Internal server error" })
  }
})

router.patch("/update/:id", async (req, res) => {
  const { id } = req.params

  const existingClass = await classes.find({ _id: id })


  try {



    if (existingClass.length <= 0) {
      return res.status(400).json({ status: "FAILURE", msg: "No classes found" })
    }
    classes.findByIdAndUpdate(id, req.body).then(() => {
      res.status(200).json({ status: "success", msg: "updated successfully " })
    })

  } catch (err) {
    res.status(200).json({ status: "FAILURE", msg: `Internal server error-${err}` || "Internal server error" })
  }



})
router.get('/findAll', function (req, res) {
  Class.find().exec((err, classes) => {

    res.status(200).json({ classes: classes });

  })
});
module.exports = router;
