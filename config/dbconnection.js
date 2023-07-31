const mongoose = require("mongoose");

// try and connect to mongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
