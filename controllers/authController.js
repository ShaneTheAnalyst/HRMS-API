const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// @desc login
// @route POST /auth/login
// @access Public
const login = async (req, res) => {
  const { username, password } = req.body;

  // check if fields exist
  if (!username || !password) {
    return res.status(400).json({ msg: "Please enter username and password" });
  }

  // check if user exists
  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  // compare passwords
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  // create access token
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  // create refresh token
  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "3d" }
  );

  // create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  // send access token containing usernames and roles
  res.json({ accessToken });
};

// @desc refresh
// @route POST /auth/refresh
// @access Public
const refresh = async (req, res) => {
  const cookies = req.cookies;

  // check if cookie exists
  if (!cookies?.jwt) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  // verify refresh token
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ msg: "Forbidden" });
      }

      // check if user exists
      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!foundUser) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      // create access token
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ accessToken });
    }
  );
};

// @desc logout
// @route POST /auth/logout
// @access Public
const logout = (req, res) => {
  const cookies = req.cookies;

  // check if cookie exists
  if (!cookies?.jwt) {
    return res.sendStatus(204);
  }

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
