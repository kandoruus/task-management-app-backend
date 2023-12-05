const User = require("mongoose-models/User");

const isValidPayload = (req) => {
  return req.body && req.body.username && req.body.sessionCode;
};

const isValidCredentials = async (req) => {
  const { username, sessionCode } = req.body;
  return (await User.findOne({ username: username, sessionCode: sessionCode })) !== null;
};

const validateSession = async (req, res, next) => {
  if (isValidPayload(req) && (await isValidCredentials(req))) {
    next();
  } else {
    res
      .status(400)
      .send({ message: "Unable to validate session. Please login again to continue." });
  }
};

module.exports = { validateSession };
