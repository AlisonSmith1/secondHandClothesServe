const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const commodityRoute = require("./routes").commodity;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

mongoose
  .connect("mongodb://127.0.0.1:27017/mongodbtext")
  .then(() => {
    console.log("連接到MongoDB");
  })
  .catch((e) => {
    console.log(e);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", authRoute);
app.use(
  "/api/commodity",
  passport.authenticate("jwt", { session: false }),
  commodityRoute
);

//port 3000是react預設port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("後端伺服器正在監聽 port ${PORT}");
});
