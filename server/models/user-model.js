const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
  },
  role: {
    type: String,
    required: true,
    enum: ["customer", "business"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.isUsernameValid = function () {
  return (
    typeof this.username === "string" &&
    this.username.trim().length >= 3 &&
    this.username.trim().length <= 20
  );
};

userSchema.methods.isEmailValid = function () {
  return (
    typeof this.email === "string" &&
    this.email.trim().length >= 6 &&
    this.email.trim().length <= 30
    // 可以考慮加上 email 格式檢查
  );
};

userSchema.methods.isPasswordValid = function () {
  return (
    typeof this.password === "string" &&
    this.password.length >= 6 &&
    this.password.length <= 50
  );
};

userSchema.methods.isCustomer = function () {
  return this.role === "customer";
};

userSchema.methods.isBusiness = function () {
  return this.role === "business";
};

userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
