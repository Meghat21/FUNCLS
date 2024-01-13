const Teacher = require("../models/teacherDetails")
const teacherDetails = async (req, res) => {

    res.json({ msg: "hello" })

}

module.exports = { teacherDetails }