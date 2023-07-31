const Task = require("../models/Task");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc get all tasks
// @route GET /tasks
// @access Private
const getTasks = async (req, res) => {
  // get all tasks from the db
  const tasks = await Task.find().sort({ createdAt: -1 }).lean();

  // if tasks do not exist
  if (!tasks?.length) {
    return res.status(400).json({ message: "No tasks found" });
  }

  // add user's username to each task
  const tasksWithUser = await Promise.all(
    tasks.map(async (task) => {
      const user = await User.findById(task.user).lean().exec();

      return { ...task, username: user.username };
    })
  );

  if (tasksWithUser) {
    res.status(200).json(tasksWithUser);
  } else {
    return res.status(400).json({ message: "No tasks found on any user" });
  }
};

// @desc get a single task
// @route GET /tasks/:id
// @access Private
const getTask = async (req, res) => {
  const { id } = req.params;

  // check if task ID is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  // find the task in the db
  const task = await Task.findById(id).lean();

  // check if task exists
  if (!task) {
    return res.status(400).json({ message: "No task found" });
  }

  // add user's username to the task
  const user = await User.findById(task.user).lean().exec();

  const tasksWithUser = { ...task, username: user.username };

  if (tasksWithUser) {
    res.status(200).json(tasksWithUser);
  } else {
    return res.status(400).json({ message: "No task found" });
  }
};

// @desc create a new task
// @route POST /tasks
// @access Private
const createTask = async (req, res) => {
  const { user, title, content } = req.body;

  // check if all fields are provided
  if (!user || !title || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // create the new task
  try {
    const task = await Task.create({ user, title, content });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// @desc update a task
// @route PATCH /tasks/:id
// @access Private
const updateTask = async (req, res) => {
  const { id } = req.params;

  // check if task id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  const { user, title, content, status } = req.body;

  // check if all fields exist
  if (!user || !title || !content || typeof status !== "boolean") {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  // check if task exists
  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "No task found" });
  }

  // update the task
  task.user = user;
  task.title = title;
  task.content = content;
  task.status = status;

  const updatedTask = await task.save();

  if (updatedTask) {
    res.status(200).json({ message: "Task updated successfully", updatedTask });
  } else {
    return res.status(400).json({ message: "Task could not be updated" });
  }
};

// @desc Delete a task
// @route DELETE /tasks/:id
// @access Private
const deleteTask = async (req, res) => {
  const { id } = req.params;

  // check if task id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  // find the task and delete
  const task = await Task.findById(id).exec();

  if (!task) {
    return res.status(400).json({ message: "No task found" });
  }

  const deletedTask = await task.deleteOne();

  if (deletedTask) {
    res.status(200).json({
      message: `Task ${deletedTask.title} with ${deletedTask._id} deleted successfully`,
    });
  } else {
    return res.status(400).json({ message: "Task could not be deleted" });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
