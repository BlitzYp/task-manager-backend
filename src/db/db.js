//Imports
const mongoose = require("mongoose");

//Connection
mongoose.connect(process.env.DB_LINK, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .then(() => console.log("Mongoose is working"))
    .catch((err) => console.log("Uh oh there was a problem connection to the database: ", err));


