// Project imports
const express = require("express");
const db = require('./db/db.js');
const userRoutes = require("./routers/user.js");
const taskRoutes = require("./routers/task.js");

// /Users/Guntis/mongodb/bin/mongod.exe --dbpath=/Users/Guntis/mongodb-data

// Project variables
const app = express();

// App settings
app.use(express.json());
app.use(userRoutes);
app.use(taskRoutes);

module.exports = app;