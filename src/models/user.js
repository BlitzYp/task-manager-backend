// Imports
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");

// User type configs
const UserNameSettings = {
    type: String,
    required: true,
    trim: true,
    unique: true
}

const UserAgeSettings = {
    type: Number,
    default: 0,
    validate(num) {
        if (!num) { throw new Error("Please provide the age!") }
    }
}

const UserEmailSettings = {
    type: String,
    required: true,
    validate(data) {
        if (validator.isEmail(data)) { return true; }
        else { throw new Error("That is not a valid email!"); }
    },
    trim: true,
    lowercase: true,
    unique: true
}

const UserPasswordSettings = {
    type: String,
    required: true,
    trim: true,
    validate(data) { if (data.length < 6 || data.toLowerCase() == "password") { throw new Error("Invalid password!"); } }
}

const pfpSettings = {
    type: Buffer
}

// email verification

// const confirmedSettings = {
//     type: Boolean
// }

const userTokenSettings = [{
    token: {
        required: true,
        type: String,
    }
}]

// The Schema
const userSchema = new mongoose.Schema({
    name: UserNameSettings,
    age: UserAgeSettings,
    email: UserEmailSettings,
    password: UserPasswordSettings,
    pfp: pfpSettings,
    //confirmed: confirmedSettings,
    tokens: userTokenSettings
}, { timestamps: true });

//Showing your profile
userSchema.methods.toJSON = function () {
    const user = this;
    const data = { name: user.name, email: user.email, _id: user._id };
    return data;
}

// Relashionship with the tasks model
userSchema.virtual("tasks", { ref: "Task", localField: "_id", foreignField: "taskUser" });

// Generating a auth token
userSchema.methods.createAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_TOKEN);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

// Logging in 
userSchema.statics.login = async function (body) {
    const { email, password } = body;
    const user = await User.findOne({ email });
    if (user) {
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) { return user; }
        throw new Error({ err: "Could not login!" });
    }
    else { throw new Error({ err: "Could not log in" }); }
}

// Delete users tasks
userSchema.pre("remove", async function (next) {
    await Task.deleteMany({ taskUser: this._id });
    next();
});

// Hashing the password
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// The User model
const User = new mongoose.model('User', userSchema);

// module exports
module.exports = User;