const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const Notification = require("../../models/Notification");

router.get("/", (req, res) => {
  const { user } = req.query;
  if (user) {
    Notification.find({ user })
    .then((notifications) => res.json(notifications));
  } else {
    Notification.find()
    .sort({ date: -1 })
    .then((notifications) => res.json(notifications));
  }
  
});

router.get("/:id", (req, res) => {
  Notification.findById(req.params.id)
    .then((notification) => {
      return res.json(notification);
    })
})

router.post("/", auth, (req, res) => {
  const { user, title, description } =
    req.body;

  if (!user || !title || !description) {
    return res.status(400).json({
      msg: "Please enter all fields",
    });
  }

  const newNotification = new Notification({
    title, 
    description, 
    status: "pending", 
    user
  });

  newNotification.save().then((notification) => res.json(notification));
});

router.put("/:id", async (req, res) => {
  try {
    var notification = await Notification.findById(req.params.id).exec();
    notification.set(req.body);

    var response = await notification.save();
    res.send(response);
  } catch (error) {
    res.status(500).send(error);
  }
})

// router.patch("/:id", async (req, res) => {
//   try {
//     var notification = await Notification.findById(req.params.id).exec();
//     notification.set(req.body);

//     var response = await notification.save();
//     res.send(response);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// })

router.delete("/:id", auth, (req, res) => {
  Notification.findById(req.params.id)
    .then((notification) =>
      notification.remove().then(() => res.json({ success: true }))
    )
    .catch((err) => res.status(400).json({ success: false, err }));
});

module.exports = router;
