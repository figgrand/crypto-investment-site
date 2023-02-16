const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const Account = require("../../models/Account");

router.get("/", (req, res) => {
  Account.find()
    .sort({ date: -1 })
    .then((accounts) => res.json(accounts));
});

router.get("/:id", (req, res) => {
  Account.findById(req.params.id)
    .then((account) => {
      return res.json(account);
    })
})

router.post("/", auth, (req, res) => {
  const { 
    currency, 
    balance, 
    status, 
    created_by, 
    modifier, 
    date_created, 
    date_modified,
    investments  
  } = req.body;

  if (!currency /*|| !balance || !created_by || !modifier*/) {
    return res.status(400).json({
      msg: "Please enter all fields",
    });
  }

    const newAccount = new Account({
        currency,
        balance,
        status: "active",
        created_by, 
        modifier, 
        date_created, 
        date_modified,
        investments
    });

    newAccount.save().then((account) => res.json(account));
});

router.put("/:id", async (req, res) => {
  try {
    var account = await Account.findById(req.params.id).exec();
    account.set(req.body);

    var response = await account.save();
    res.send(response);
  } catch (error) {
    res.status(500).send(error);
  }
})

router.delete("/:id", auth, (req, res) => {
  Account.findById(req.params.id)
    .then((account) =>
      account.remove().then(() => res.json({ success: true }))
    )
    .catch((err) => res.status(400).json({ success: false, err }));
});

module.exports = router;