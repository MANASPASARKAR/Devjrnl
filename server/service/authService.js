const jwt = require("jsonwebtoken");

const setUser = (user) => {
    const payload = {
        email: user.email,
        _id: user._id,
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "168h" });
}

function getUser(token) {
  try {
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {setUser, getUser};