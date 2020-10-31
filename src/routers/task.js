// Imports
const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
const authentication = require("../middleware/auth");

// Get tasks
router.get('/tasks', authentication, async (req, res) => {
    let matchOptions = {};
    let sortOptions = {};

    if (req.query.sort) {
        const splited = req.query.sort.split("_");
        sortOptions[splited[0]] = splited[1] === "desc" ? -1 : 1;
    }

    if (req.query.taskCompleted) {
        matchOptions.taskCompleted = req.query.taskCompleted === "true";
    }

    try {
        await req.info.populate({
            path: "tasks",
            match: matchOptions,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sortOptions
            }
        }).execPopulate();

        res.send(req.info.tasks);
    }
    catch (err) {
        res.status(404).send(err);
    }
})

router.get('/tasks/:id', authentication, async (req, res) => {
    try {
        const data = await Task.findOne({ _id: req.params.id, taskUser: req.info._id });
        if (data) { res.send(data); }
        else { return res.status(404).send("No task found"); }
    }
    catch (err) {
        res.status(404).send(err);
    }
})

// Update tasks
router.patch("/tasks/:id", authentication, async (req, res) => {
    const valid = { taskName: true, taskCompleted: true, taskDescription: true };
    const requests = Object.keys(req.body);
    const isAllValid = requests.every((k) => { return valid[k]; });
    try {
        if (isAllValid) {
            const task = await Task.findOne({ _id: req.params.id, taskUser: req.info._id })
            if (!task) { return res.status(404).send("No such task found"); }
            requests.map((update) => { task[update] = req.body[update]; })
            await task.save();
            res.status(202).send(task);
        }
        else {
            return res.status(400).send({ err: "Invalid update" });
        }
    }
    catch (err) {
        res.status(500).send(err);
    }
})

// Creating a new task
router.post('/tasks', authentication, async (req, res) => {
    const task = new Task({ ...req.body, taskUser: req.info._id });
    try {
        await task.save();
        res.status(200).send(task);
    }
    catch (err) {
        res.status(400).send(err);
    }
})


// Delete tasks
router.delete("/tasks/:id", authentication, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, taskUser: req.info._id });
        if (!task) { return res.status(404).send({ err: "Could not delete task" }) }
        res.status(202).send({ taskName: task.taskName });
    }
    catch (err) {
        res.status(500).send(err);
    }
})


module.exports = router;