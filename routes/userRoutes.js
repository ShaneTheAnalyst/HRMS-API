const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
} = require("../controllers/usersController");

const router = express.Router();

// verify jwt
router.use(verifyJWT);

// get all users
router.get("/", getUsers);

// get a single user
router.get("/:id", getUser);

// create a user
router.post("/", createUser);

// update a user
router.patch("/:id", updateUser);

// res a user's password
router.patch("/password/:id", resetPassword);

// delete a user
router.delete("/:id", deleteUser);

module.exports = router;
