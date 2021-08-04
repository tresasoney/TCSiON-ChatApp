const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://user:user@tcsionfiles.o2gy7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');


const Schema = mongoose.Schema;
const EmailVerifySchema = new Schema({
    email: String,
    otp: String
});

var EmailVerifyData = mongoose.model('emailverifydata', EmailVerifySchema);
module.exports = EmailVerifyData;
