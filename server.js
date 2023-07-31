require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/dbconnection");
const corsOptions = require("./config/corsOptions");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 5000;

const app = express();

console.log(process.env.NODE_ENV);

// connect to db
connectDB();

// middleware
app.use(cors(corsOptions));

app.use(express.json());

app.use(morgan("dev"));

// cookie parser
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// routes that do not exist
app.use((req, res) => {
  res.status(404).json({ message: "Route does not exist" });
});

// check conection to db and listen to requests
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${port}`)
  );
});

mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error: ", err);
});
