const ApiError = require("./utils/ApiError");
const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
require("./model");
dotenv.config();
const connect = require("./db/db");

connect();
const server = require("http").createServer(app);
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
const auth = require("./routes/auth");
app.use(auth);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err?.statusCode).json({ status: 0, message: err?.message, data: err?.data });
  } else {
    return res.status(500).json({ status: 0, message: "Something went wrong", err: err?.message });
  }
});
const PORT = process.env.PORT || 8000;
server.listen(PORT, (req, res) => {
  console.log(`Server running on ${PORT}`);
});
