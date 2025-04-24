const mongoose = require("mongoose");
const { Schema } = mongoose;
const CATEGORY_LIST = require("./constants/category");

const commoditySchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 25,
  },
  price: {
    type: Number,
    required: true,
    min: 1,
    max: 100000,
  },
  description: {
    type: String,
    minlength: 6,
    maxlength: 500,
  },

  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  customers: { type: [String], default: [] },
});

// 標題驗證
commoditySchema.methods.isTitleValid = function () {
  return (
    typeof this.title === "string" &&
    this.title.trim().length >= 6 &&
    this.title.trim().length <= 25
  );
};

// 價格驗證
commoditySchema.methods.isPriceValid = function () {
  return (
    typeof this.price === "number" &&
    !isNaN(this.price) &&
    this.price >= 1 &&
    this.price <= 100000
  );
};

// 敘述驗證
commoditySchema.methods.isDescriptionValid = function () {
  return (
    typeof this.description === "string" &&
    this.description.trim().length >= 6 &&
    this.description.trim().length <= 500
  );
};

// 圖片驗證
commoditySchema.methods.isImageValid = function () {
  return typeof this.image === "string" && this.image.trim().length > 0;
};

// 數量驗證
commoditySchema.methods.isQuantityValid = function () {
  return (
    typeof this.quantity === "number" &&
    !isNaN(this.quantity) &&
    this.quantity >= 1 &&
    this.quantity <= 1000
  );
};

// 類別驗證（是否為特定類別）
commoditySchema.methods.isCategory = function (targetCategory) {
  return this.category === targetCategory;
};

module.exports = mongoose.model("Commodity", commoditySchema);
