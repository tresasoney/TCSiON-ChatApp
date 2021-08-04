const express = require('express');
const userRouter = express.Router();

const UserData = require('../models/UserData');
var EmailVerifyData = require('../models/EmailVerifyData');
var ChatData = require('../models/ChatData');

userRouter.post('/signup', (req, res) => {
    var userDetails = req.body.user;
    delete userDetails["_id"];
    var user = UserData(userDetails);
    user.save();
    EmailVerifyData.findOneAndDelete({ email: user.email }).then(() => { })
    res.send({ "message": "success" });

});

userRouter.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    UserData.find({ username: username, password: password }).then(data => {
        if (data[0]) {
            data[0].availability = "online";
            data[0].save()
            res.send({ "message": "success", "id": data[0]._id, "username": data[0].username });
        }
        else {
            res.send({ "message": "failure" });
        }
    })
});


userRouter.post('/dupeUsernameCheck', (req, res) => {
    var username = req.body.username;
    UserData.find({ username: username }).then(data => {
        if (data[0]) {
            console.log(data)
            res.send({ "message": "found" });
        }
        else {
            res.send({ "message": "notfound" });
        }
    })
});

userRouter.post('/dupeEmailCheck', (req, res) => {
    var email = req.body.email;
    UserData.find({ email: email }).then(data => {
        if (data[0]) {
            console.log(data)
            res.send({ "message": "found" });
        }
        else {
            res.send({ "message": "notfound" });
        }
    })
});

userRouter.post('/searchuser', (req, res) => {
    var searchterm = req.body.username;
    UserData.find({}, { firstName: 1, lastName: 1, username: 1, picture: 1, _id: 0, }).then(data => {
        if (data[0]) {
            let users = data.filter(item => item.username.startsWith(searchterm));
            if (users) {
                res.send({ "message": "found", "users": users });
            }
            else {
                res.send({ "message": "notfound" });
            }
        }
        else {
            res.send({ "message": "notfound" });
        }
    })
});

userRouter.post('/addContactToBoth', (req, res) => {
    var firstUsername = req.body.firstUsername;
    var secondUsername = req.body.secondUsername;
    UserData.find({ username: firstUsername }, { contacts: 1 }).then(data => {
        if (!data[0].contacts.includes(secondUsername)) {
            data[0].contacts.push(secondUsername);
            data[0].save()
        }

        UserData.find({ username: secondUsername }, { contacts: 1 }).then(data2 => {
            if (!data2[0].contacts.includes(firstUsername)) {
                data2[0].contacts.push(firstUsername);
                data2[0].save()
            }
            var newChat = new ChatData();
            newChat.firstUser = firstUsername;
            newChat.secondUser = secondUsername;
            newChat.chat = [];
            newChat.save()
            res.send({ "message": "success" });
        });
    });
});


userRouter.post('/getOnlineContacts', (req, res) => {
    var id = req.body.id;
    UserData.find({ _id: id }, { contacts: 1, mutedContacts: 1, blockedContacts: 1, _id: 0 }).then(data => {
        if (data[0].contacts) {
            UserData.find({ username: { $in: data[0].contacts }, availability: "online" }, { firstName: 1, lastName: 1, username: 1, picture: 1, _id: 0, }).then(users => {
                res.send({ "message": "success", "contacts": users, "mutedContacts": data[0].mutedContacts, "blockedContacts": data[0].blockedContacts });
            });
        }
        else {
            res.send({ "message": "failure" });
        }
    });
});

userRouter.post('/MuteBlockStatus', (req, res) => {
    var id = req.body.id;
    var contactUsername = req.body.contactUsername;
    let muteStatus = false;
    let blockStatus = false;
    UserData.find({ _id: id }, { mutedContacts: 1, blockedContacts: 1, _id: 0 }).then(data => {
        if (data[0]) {

            blockStatus = data[0].blockedContacts.includes(contactUsername);
            muteStatus = data[0].mutedContacts.includes(contactUsername);

            res.send({ "message": "success", "blockStatus": blockStatus, "muteStatus": muteStatus });
        }
        else {
            res.send({ "message": "failure" });
        }
    });
});

userRouter.post('/toggleBlock', (req, res) => {
    var id = req.body.id;
    var contactUsername = req.body.contactUsername;
    let blockStatus;
    UserData.find({ _id: id }, { blockedContacts: 1 }).then(data => {
        if (data[0]) {
            if (data[0].blockedContacts.includes(contactUsername)) {
                blockStatus = false;
                // delete data[0].blockedContacts[data[0].blockedContacts.indexOf(contactUsername)];
                data[0].blockedContacts = data[0].blockedContacts.filter(item => item != contactUsername);
            }
            else {
                data[0].blockedContacts.push(contactUsername);
                blockStatus = true;
            }
            UserData.findByIdAndUpdate({ _id: id }, data[0], (err) => {
                if (err) console.log(err);
                else {
                    res.send({ "message": "success", "blockStatus": blockStatus });
                }

            });
        }
        else {
            res.send({ "message": "failure" });
        }
    });
});

userRouter.post('/toggleMute', (req, res) => {
    var id = req.body.id;
    var contactUsername = req.body.contactUsername;
    let muteStatus = false;
    UserData.find({ _id: id }, { mutedContacts: 1 }).then(data => {
        if (data[0]) {
            if (data[0].mutedContacts.includes(contactUsername)) {
                // delete data[0].mutedContacts[data[0].mutedContacts.indexOf(contactUsername)];
                data[0].mutedContacts = data[0].mutedContacts.filter(item => item != contactUsername);
            }
            else {
                data[0].mutedContacts.push(contactUsername);
                muteStatus = true;
            }
            UserData.findByIdAndUpdate({ _id: id }, data[0], (err) => {
                if (err) console.log(err);
                else {
                    res.send({ "message": "success", "muteStatus": muteStatus });
                }

            });
        }
        else {
            res.send({ "message": "failure" });
        }
    });
});


module.exports = userRouter;