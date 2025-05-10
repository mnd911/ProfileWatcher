const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = process.env.URL;
const mongoose = require("mongoose")

mongoose.connect(uri)
  .then (()=>console.log("connected"))
  .catch(err=>console.log(err))
module.exports = mongoose;