// Imports
const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const authentication = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendMailToNewUser, sendByeEmail } = require("../email/acc");
//const jwt = require("jsonwebtoken");

// Display the current user you are logged in as
router.get('/users/myProfile', authentication, async (req, res) => {
    res.send(req.info);
})

// Update user
router.patch("/users/updateMe", authentication, async (req, res) => {
    const valid = { name: true, age: true, email: true, password: true };
    const keys = Object.keys(req.body);
    const isAllValid = keys.every((k) => { return valid[k]; })
    try {
        if (isAllValid) {
            for (let i = 0; i < keys.length; i++) {
                req.info[keys[i]] = req.body[keys[i]];
            }
            await req.info.save();
            return res.status(200).send(req.info);
        }
        else { return res.status(404).send({ err: "Invalid updates!" }); }
    }
    catch (err) {
        res.status(500).send({ err: "Could not update user" });
    }
})

// Logging in
router.post("/users/login", async (req, res) => {
    try {
        const user = await User.login(req.body);
        const token = await user.createAuthToken();
        res.status(200).send({ user, token });
    }
    catch (err) {
        res.status(404).send(err);
    }
})

// Logging out
router.post("/users/logout", authentication, async (req, res) => {
    try {
        req.info.tokens = req.info.tokens.filter((token) => { return token.token !== req.currentToken; })
        await req.info.save();
        res.send("Logging out!");
    }
    catch (err) {
        res.status(500).send(err);
    }
})


//Logout of all sessions
router.post("/users/logoutAll", authentication, async (req, res) => {
    try {
        req.info.tokens = [];
        await req.info.save();
        res.send("Logged out of all sessions!");
    }
    catch (err) {
        res.status(500).send(err);
    }
})

// Creating a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        const token = await user.createAuthToken();
        await user.save();
        sendMailToNewUser(user.email, user.name);
        res.status(201).send({ user, token });
    }
    catch (err) {
        res.status(400).send(err);
    }
})

// Delete a user
router.delete("/users/deleteMe", authentication, async (req, res) => {
    try {
        const { email, name } = req.info;
        await req.info.remove();
        await sendByeEmail(email, name);
        res.status(200).send(req.info);
    }
    catch (err) {
        res.status(500).send(err);
    }
})

// Check if the file provided is valid
const upload = multer({
    limits: { fileSize: 1000000 },
    fileFilter(req, file, cb) {
        const fileReg = /^.*\.(jpeg|png|jpg)/;
        if (!fileReg.exec(file.originalname)) {
            return cb(new Error("File extension not valid!"));
        }
        cb(undefined, true);
    }
});

// Avatar uploads
router.post("/users/me/pfp", authentication, upload.single("pfp"), async (req, res) => {
    try {
        const newImage = await sharp(req.file.buffer).png().resize(200, 200).toBuffer();
        req.info.pfp = newImage;
        await req.info.save();
        res.status(200).send();
    }
    catch (err) {
        res.status(400).send(err);
    }
}, (err, req, res, next) => {
    res.status(404).send({ err: "Could not upload pfp" });
})


// Delete pfp
router.delete("/users/me/pfp", authentication, async (req, res) => {
    try {
        req.info.pfp = null;
        await req.info.save();
        res.status(200).send();
    }
    catch (err) {
        res.status(500).send(err);
    }
})

// Fetching users pfp
router.get("/users/:id/pfp", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user && user.pfp) {
            res.set("Content-type", "image/jpg");
            res.send(user.pfp);
        } else {
            throw new Error({ err: "Could not find user pfp" });
        }
    }
    catch (err) {
        res.status(404).send(err);
    }
})

// Start for email verification

// router.get("/users/confirm/:token", async (req, res) => {
//     try {
//         const token = req.params.token;
//         const isValid = await jwt.verify(token, "usertoken");
//         if (isValid) {
//             const user = await User.findById(isValid.id);
//             if (!user) { throw new Error(); }
//             user.confirmed = true;
//             user.save();
//         } else {
//             throw new Error();
//         }
//     } catch (err) {
//         res.status(404).json();
//     }
// })

// Exporting the routes
module.exports = router;