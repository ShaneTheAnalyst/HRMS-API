const User = require("../models/User");
const Task = require("../models/Task");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validator = require("validator");
const signupMail = require("../services/signupMail");

// @desc get all users
// @route GET /users/
// @access Private
const getUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  // check if users exists
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.status(200).json(users);
};

// @desc get a single user
// @route GET /users/:id
// @access Private
const getUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    return res
      .status(400)
      .json({ message: "Could not find a user with that ID" });
  }

  res.status(200).json(user);
};

// @desc create a new user
// @route POST /users/
// @access Private
const createUser = async (req, res) => {
  const { fullName, email, username, password, roles } = req.body;

  // check if all fields are filled
  if (!fullName || !email || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // validate email and password fields
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password is not strong enough, must be at least 8 characters long, include at least one upppercase letter, one lowercase letter, one number and one special character (e.g., !, @, #, $, etc.)"
    );
  }

  // check if email and username already exists
  const emailExists = await User.findOne({ email }).lean().exec();

  if (emailExists) {
    return res
      .status(409)
      .json({ message: "An account with this email already exists" });
  }

  const usernameExists = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (usernameExists) {
    return res
      .status(409)
      .json({ message: "An account with this username already exists" });
  }

  // generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create the user in the db
  const user = await User.create({
    fullName,
    email,
    username,
    password: hashedPassword,
    roles,
  });

  if (user) {
    res
      .status(201)
      .json({ message: `New user ${username} created successfully` });

    // send mail
    signupMail(fullName, email, username, roles);
  } else {
    res
      .status(400)
      .json({ message: "Invalid user data received, could not create user" });
  }
};

// @desc update a user
// @route PATCH /users/:id
// @access Private
const updateUser = async (req, res) => {
  const { id } = req.params;

  // check if user id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const { fullName, email, username, roles, active } = req.body;

  // check if all fields are filled
  if (
    !fullName ||
    !email ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  // check if user exists
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // check if username, email already exists
  const emailExists = await User.findOne({ email }).lean().exec();

  if (emailExists && emailExists?._id.toString() !== id) {
    return res
      .status(409)
      .json({ message: "An account with this email already exists" });
  }

  const usernameExists = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (usernameExists && usernameExists?._id.toString() !== id) {
    return res
      .status(409)
      .json({ message: "An account with this username already exists" });
  }

  // update user
  user.fullName = fullName;
  user.email = email;
  user.username = username;
  user.roles = roles;
  user.active = active;

  const updatedUser = await user.save();

  if (updateUser) {
    res
      .status(200)
      .json({ message: `User ${updatedUser.username} updated successfully` });
  } else {
    return res.status(400).json({ message: "Could not update user" });
  }
};

// @desc update user password
// @route PATCH /users/password/:id
// @access Private
const resetPassword = async (req, res) => {
  const { id } = req.params;

  // check`if user id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const { password } = req.body;

  // check if the new password has been entered
  if (!password) {
    return res.status(400).json({ mesage: "Password field is empty" });
  }

  const user = await User.findById(id).exec();

  // check if user exists
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // hash and update the password
  try {
    user.password = await bcrypt.hash(password, 10);
    const updatedUser = await user.save();
    if (updatedUser) {
      res.json({ message: "Password updated successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Password failed to update" });
  }
};

// @desc delete a user
// @route DELETE /users/:id
// @access Private
const deleteUser = async (req, res) => {
  const { id } = req.params;

  // check`if user id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  // find and delete all tasks associated with the user
  const deletedTasks = await Task.deleteMany({ user: id }).exec();

  if (!deletedTasks) {
    return res
      .status(400)
      .json({ message: "Could not delete the user's tasks" });
  }

  // find and delete the user
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "Could not find the user" });
  }

  const deletedUser = await user.deleteOne();

  if (deletedUser) {
    res.json({
      message: `User ${deletedUser.username} with ID ${deleteUser._id} deleted successfully`,
    });
  } else {
    return res.status(400).json({ message: "Could not delete the user" });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
};
