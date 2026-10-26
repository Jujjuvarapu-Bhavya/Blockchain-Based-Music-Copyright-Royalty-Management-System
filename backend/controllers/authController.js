const db = require("../models/dbAdapter");

exports.getUsers = (req, res) => {
  const users = db.getCollection("users");
  res.json({ success: true, users });
};

exports.getCurrentUser = (req, res) => {
  const userId = req.headers["x-user-id"] || "usr_artist";
  const user = db.findOne("users", { id: userId }) || db.getCollection("users")[0];
  res.json({ success: true, user });
};

exports.switchUser = (req, res) => {
  const { userId } = req.body;
  const user = db.findOne("users", { id: userId });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, user });
};
