const mongoose = require("mongoose");

const connect = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.mongoUrl}`);
    console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

module.exports = connect;
