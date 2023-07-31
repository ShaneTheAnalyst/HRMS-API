const express = require("express");
const { login, refresh, logout } = require("../controllers/authController");

const router = express.Router();

// login
router.post("/login", login);

// refresh jwt
router.get("/refresh", refresh);

// logout
router.post("/logout", logout);

module.exports = router;
