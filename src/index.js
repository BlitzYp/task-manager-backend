const app = require("./app.js");
const port = process.env.PORT;

// Listening
app.listen(port, console.log(`Server running on port ${port}`))
