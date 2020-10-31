// Imports
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authentication = async (req, res, next) => {
    try {
        const authToken = req.header("Authorization").replace("Bearer ", "");
        const isValid = jwt.verify(authToken, process.env.JWT_TOKEN);
        if (isValid) {
            const user = await User.findOne({ _id: isValid._id, "tokens.token": authToken });
            if (!user) { throw new Error("Could not authenticate"); }
            req.info = user;
            req.currentToken = authToken;
            next();
        }
        else { throw new Error("Could not authenticate!"); }
    }
    catch (err) {
        res.status(404).send({ err: err });
    }
}



module.exports = authentication;
