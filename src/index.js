// Project imports
const express = require("express");
const db = require('./db/db.js');
const userRoutes = require("./routers/user");
const taskRoutes = require("./routers/task");

// Project variables
const app = express();
const port = process.env.PORT;

// App settings
app.use(express.json());
app.use(userRoutes);
app.use(taskRoutes);

// Listening
app.listen(port, console.log(`Server running on port ${port}`))
