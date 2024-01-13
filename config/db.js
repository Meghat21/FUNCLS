const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config()
const DBconnection = async () => {
  console.log(process.env.MONGO_URI)
  const conn = await mongoose
    .connect(process.env.MONGO_URI, {

    })
    .catch(err => {
      console.log(`For some reasons we couldn't connect to the DB`.red, err)
    })

  console.log(`MongoDB Connected:`.cyan.underline.bold)
}

module.exports = DBconnection
