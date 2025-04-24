const { createSearchIndex } = require("../models/commodity-models");

const router = require("express").Router();
const Commodity = require("../models").commodity;
const commodityValidation = require("../validation").commodityValidation;

router.use((req, res, next) => {
  console.log("正在接收一個跟commodity有關的請求");
  next();
});

router.get("/", async (req, res) => {
  try {
    let commodityFound = await Commodity.find({})
      .populate("business", ["username", "email"])
      .exec();
    return res.send(commodityFound);
  } catch (e) {
    res.status(500).send(e);
  }
});

//用商家id搜尋商品
router.get("/businesss/:_busniess_id", async (req, res) => {
  let { _busniess_id } = req.params;
  try {
    let commodityFound = await Commodity.find({ business: _busniess_id })
      .populate("business", ["username", "email"])
      .exec();
    return res.send(commodityFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//用買家id搜尋購買商品
router.get("/customers/:_customers_id", async (req, res) => {
  let { _customers_id } = req.params;
  let commodityFound = await Commodity.find({ customers: _customers_id })
    .populate("business", ["username", "email"])
    .exec();
  return res.send(commodityFound);
});

//用商品名稱尋找商品
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let commodityFound = await Commodity.find({ title: name })
      .populate("business", ["email", "username"])
      .exec();
    return res.send(commodityFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//用商品id搜尋商品
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let commodityFound = await Commodity.findOne({ _id })
      .populate("business", ["email"])
      .exec();
    return res.send(commodityFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//新增商品
router.post("/", async (req, res) => {
  //驗證數據符合規範
  const { error } = commodityValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isCustomer()) {
    return res.status(400).send("客戶無法新增商品");
  }

  let { title, description, price } = req.body;
  try {
    let newCommodity = new Commodity({
      title,
      description,
      price,
      business: req.user._id,
    });
    let savedCommodity = await newCommodity.save();
    // 將商品ID加入商家的商品列表中
    return res.send({ message: "新商品已經保存", savedCommodity });
  } catch (e) {
    res.status(500).send("無法創建商品");
  }
});

//讓買家透過商品id來註冊新商品
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let commodity = await Commodity.findOne({ _id }).exec();
    commodity.customers.push(req.user._id);
    await commodity.save();
    return res.send("註冊完成");
  } catch (e) {
    return res.send(e);
  }
});

router.get("/commodity/:id", async (req, res) => {
  const { id } = req.params;
  const found = await Commodity.findById({ name: id }).populate("business", [
    "username",
    "email",
  ]);
  res.send(found);
});

//更新商品
router.patch("/update/:id", async (req, res) => {
  //驗證數據符合規範
  const { error } = commodityValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { id } = req.params;
  //確認商品存在
  try {
    let commodityFound = await Commodity.findOne({ _id: id }).exec();
    if (!commodityFound) {
      return res.status(400).send("商品不存在");
    }

    //使用者必須是商家，才能編輯商品
    if (commodityFound.business.equals(req.user._id)) {
      let updateCommodity = await Commodity.findOneAndUpdate(
        { _id: id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      return res.send({ message: "商品已經更新", updateCommodity });
    } else {
      return res.status(403).send("只有此商家才可以編輯商品");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.delete("/delete/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let commodityFound = await Commodity.findOne({ _id: id }).exec();
    if (!commodityFound) {
      return res.status(400).send("商品不存在");
    }

    //使用者必須是商家，才能刪除商品
    if (commodityFound.business.equals(req.user._id)) {
      await Commodity.deleteOne({ _id: id }).exec();
      return res.send("商品已經刪除");
    } else {
      return res.status(403).send("只有此商家才可以刪除商品");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
