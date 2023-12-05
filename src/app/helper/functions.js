const User = require("mongoose-models/User");

const validateSession = async (req, res, next) => {
  const { username, sessionCode } = req.body;
  if ((await User.findOne({ username: username })).sessionCode !== sessionCode) {
    res.status(400).send({ message: "Unable to valid session. Please login again to continue." });
  } else {
    next();
  }
};

module.exports = { validateSession };
