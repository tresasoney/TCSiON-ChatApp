const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://user:user@tcsionfiles.o2qy7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');


const Schema = mongoose.Schema;
const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    bio: String,
    availability: String,
    phone: String,
    picture: String,
    profileSettings: Array,
    username: String,
    password: String,
    contacts: Array,
    mutedContacts: Array,
    blockedContacts: Array
});

var UserData = mongoose.model('userdata', UserSchema);
module.exports = UserData;
