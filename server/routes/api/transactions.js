const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const Transaction = require("../../models/Transaction");

router.get("/", (req, res) => {
  Transaction.find()
    .sort({ date: -1 })
    .then((transactions) => res.json(transactions));
});

router.get("/:id", (req, res) => {
  Transaction.findById(req.params.id)
    .then((transaction) => {
      return res.json(transaction);
    })
})

router.post("/", auth, (req, res) => {
  const { type, currency, amount, created_by, upline, status, plan_id, btc_wallet } =
    req.body;
 // console.log({type, currency, amount, created_by, upline });
  if (!type || !amount || !currency || !created_by) {
    return res.status(400).json({
      msg: "Please enter all fields",
    });
  }

  const newTransaction = new Transaction({
    type,
    currency, 
    amount, 
    status: status || "pending", 
    created_by,
    modifier: created_by,
    upline,
    plan_id,
    btc_wallet
  });

  newTransaction.save().then((transaction) => {
    res.json(transaction)
  });
});

router.put("/:id", async (req, res) => {
  try {
    var transaction = await Transaction.findById(req.params.id).exec();
    transaction.set(req.body);

    var response = await transaction.save();
    res.send(response);
  } catch (error) {
    res.status(500).send(error);
  }
})

router.delete("/:id", auth, (req, res) => {
  Transaction.findById(req.params.id)
    .then((transaction) =>
      transaction.remove().then(() => res.json({ success: true }))
    )
    .catch((err) => res.status(400).json({ success: false, err }));
});

module.exports = router;
