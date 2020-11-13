// Imports
const sgm = require("@sendgrid/mail");

//Setting the api key
sgm.setApiKey(process.env.API_KEY);

const sendMailToNewUser = async (email, name) => {
    try {
        const msg = {
            to: email,
            from: 'demonblotz@gmail.com',
            subject: "Sign up notice",
            text: `Thank you, ${name} for signing up for task manager app! I hope you enjoy it!`,
        }
        await sgm.send(msg);
    }
    catch (err) {
        throw new Error("Could not send email");
    }
}

const sendByeEmail = async (email, name) => {
    try {
        const msg = {
            to: email,
            from: 'demonblotz@gmail.com',
            subject: "Deletion",
            text: `Shame that you will be leaving us, ${name}. If you change your mind you can always create a new account :)`,
        }
        await sgm.send(msg);
    }
    catch (err) {
        throw new Error("Could not send email");
    }
}

module.exports = {
    sendMailToNewUser,
    sendByeEmail
};