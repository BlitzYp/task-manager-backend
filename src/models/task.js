//Imports
const mongoose = require("mongoose");

// Task settings
const taskName = {
    type: String,
    required: true
}

const taskCompleted = {
    type: Boolean,
    default: false
}

const taskDescription = {
    type: String,
    trim: true,
    required: true
}

const taskUser = {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
}

const taskSchema = new mongoose.Schema({
    taskName: taskName,
    taskCompleted: taskCompleted,
    taskDescription: taskDescription,
    taskUser: taskUser
}, { timestamps: true });


const Task = new mongoose.model("Task", taskSchema);
module.exports = Task;