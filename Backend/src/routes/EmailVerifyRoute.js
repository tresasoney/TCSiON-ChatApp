const express = require('express')
var EmailVerifyRoute = express.Router();

var EmailVerifyData = require('../models/EmailVerifyData');

function otpGenerator() {
    return (Math.random() * 100000000000).toString().substring(0, 6);
}

var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'chatapp.nodemailer@gmail.com',
        pass: 'NodemPassword'
    }
});

function sendMessage(email, otp) {

    var message = {
        from: "sanjays.donotreply@gmail.com",
        to: email,
        subject: "ChatApp - Verify your email to continue your account registration",
        text: "",
    };
    message.text = "Your One Time Password to verify your email is " + otp + ". Please don't share your password with anyone else!";

    transporter.sendMail(message, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            updateDB(email, otp);

        }
    });
}

function updateDB(email, otp) {
    EmailVerifyData.find({ email: email }).then(data => {
        if (data[0]) {
            data[0].otp = otp;
            data[0].save();
        }
        else {
            var newEmail = EmailVerifyData({ "email": email, "otp": otp });
            newEmail.save();
        }
    });
};

EmailVerifyRoute.post('/initiateMailVerification', (req, res) => {
    var email = req.body.email;
    var otp = otpGenerator();
    sendMessage(email, otp);
    res.send({ "message": "success" });
});

EmailVerifyRoute.post('/verifyMailOtp', (req, res) => {
    var email = req.body.email;
    var otp = req.body.otp;
    console.log(email,otp);
    EmailVerifyData.find({ email: email }).then(data => {
        console.log(data)
        if (data[0].otp==otp) {
            res.send({ "message": "success" });
        }
        else {
            res.send({ "message": "failure" });
        }
    });
});


module.exports = EmailVerifyRoute;