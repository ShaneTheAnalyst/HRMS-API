const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const { authorization } = req.headers;

  // check if authorization starts with bearer
  if (!authorization || !authorization.startsWith("Bearer")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // grab token from authorization header
  const token = authorization.split(" ")[1];

  // verify token
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;

    next();
  } catch (err) {
    console.log(err);

    return res.status(403).json({ message: "Forbidden" });
  }
};

module.exports = verifyJWT;
