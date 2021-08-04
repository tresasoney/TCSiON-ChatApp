var express = require('express');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
        methods: "*"
    }
});

app.use(express.static('./public'));

const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

const bodyparser = require('body-parser');
app.use(bodyparser.json());

app.use(express.json())

const UserRoute = require('./src/routes/UserRoute');
app.use('/users', UserRoute);

const EmailVerifyRoute = require('./src/routes/EmailVerifyRoute');
app.use('/email', EmailVerifyRoute);

app.use(express.urlencoded({ extended: true }));

app.get('/test', (req, res) => {
    res.send("working")
});

var ChatData = require('./src/models/ChatData');
var UserData = require('./src/models/UserData');

let connectedUsers = [];
let joinedrooms = {};
io.on('connection', (socket) => {
    console.log('User Connected');
    let id;
    // let id=socket.handshake.query.username;
    socket.on('id', (data) => {
        id = data;
        connectedUsers.push(id);
        console.log(data)
        socket.join(id);
        socket.emit('test event', "hello" + id);
        UserData.find({ username: id }, { picture: 1 }).then(data => {
            socket.emit('get profile picture', { "picture": data[0].picture });
        })
        UserData.find({ username: id }, { availability: 1, contacts: 1 }).then(data => {
            if (data[0]) {
                data[0].availability = "online";
                data[0].save()
            }
            data[0].contacts.forEach(contact => {
                if (connectedUsers.includes(contact)) {
                    refreshOnlineContacts(contact);
                }

            });
        });
    });

    socket.on('join chat', (contactName) => {
        joinedrooms[id] = contactName;
        sendChat(id, contactName);
    });

    socket.on('send message', (data) => {
        sendMessageToContact(data, id);
    });

    socket.on('send contacts request', (username) => {
        getContacts(username);
    });


    socket.on('disconnect', () => {
        console.log('User Disconnected: ' + id);
        connectedUsers = connectedUsers.filter(item => item != id);
        delete joinedrooms[id];
        console.log(connectedUsers)
        UserData.find({ username: id }, { availability: 1, contacts: 1 }).then(data => {
            if (data[0]) {
                data[0].availability = "offline";
                data[0].save()
            }
            data[0].contacts.forEach(contact => {
                if (connectedUsers.includes(contact)) {
                    refreshOnlineContacts(contact);
                }

            });
        });
    })
});

function refreshOnlineContacts(username) {
    io.to(username).emit('refresh online contacts', { "message": "refresh" });
}

function getContacts(username) {
    UserData.find({ username: username }, { contacts: 1, mutedContacts: 1, blockedContacts: 1, _id: 0 }).then(data => {
        if (data[0].contacts) {
            let contactsToSend;
            UserData.find({ username: { $in: data[0].contacts } }, { firstName: 1, lastName: 1, username: 1, picture: 1, _id: 0, }).then(users => {
                let contactsFromDB = users;
                let contactsInRecentOrder = [];
                data[0].contacts.forEach(contact => {
                    contactsInRecentOrder.push(contactsFromDB.filter(item => item.username == contact)[0])
                });
                // console.log(username, data[0].contacts)
                contactsToSend = { "message": "success", "contacts": contactsInRecentOrder.reverse(), "mutedContacts": data[0].mutedContacts, "blockedContacts": data[0].blockedContacts, "contactNamesList": data[0].contacts };
                io.to(username).emit('receive contacts', contactsToSend);
            });
        }
        else {
            contactsToSend = { "message": "failure" };
            io.to(username).emit('receive contacts', contactsToSend);
        }
    });
}

function sendChat(id, contactName) {
    ChatData.find({ firstUser: { $in: [id, contactName] }, secondUser: { $in: [id, contactName] } }, { _id: 0 }).then(data => {
        if (data[0]) {
            io.to(id).emit('receive old messages', data[0]);
        }
    });
}


function sendMessageToContact(data, id) {
    if (connectedUsers.includes(data.contactUsername) && joinedrooms[data.contactUsername] == id) {
        let message = { messageContent: data.message, messageType: data.messageType, messageSender: data.username, messageTime: data.messageTime };
        io.to(data.contactUsername).emit('receive message from contact', { message: message, time: Date.now() });
    }
    else if (connectedUsers.includes(data.contactUsername)) {
        io.to(data.contactUsername).emit('new message received', { "contactName": id });
    }
    addMessageToChat(id, data.contactUsername, data);
}
function addMessageToChat(id, contactName, data) {
    ChatData.find({ firstUser: { $in: [id, contactName] }, secondUser: { $in: [id, contactName] } }).then(ChatRoom => {
        if (ChatRoom[0]) {
            let message = { messageContent: data.message, messageType: data.messageType, messageSender: data.username, messageTime: data.messageTime };
            ChatRoom[0].chat.push(message);
            ChatRoom[0].save();
        }
    });
    UserData.find({ username: id }, { contacts: 1 }).then(user1 => {
        var refreshArray = [];
        if (user1[0]) {
            user1[0].contacts = user1[0].contacts.filter(item => item != contactName);
            user1[0].contacts.push(contactName);
            UserData.findOneAndUpdate({ username: id }, user1[0], (err, res) => {
                if (err) console.log(err)
            });
            refreshArray.push(id);
        }
        UserData.find({ username: contactName }, { contacts: 1, mutedContacts: 1, blockedContacts: 1 }).then(user2 => {
            if (user2[0]) {
                if (!user2[0].mutedContacts.includes(id) && !user2[0].blockedContacts.includes(id)) {
                    user2[0].contacts = user2[0].contacts.filter(item => item != id);
                    user2[0].contacts.push(id);
                    UserData.findOneAndUpdate({ username: contactName }, user2[0], (err, res) => {
                        if (err) console.log(err)
                    });
                    refreshArray.push(contactName);
                }
            }
            refreshContacts(refreshArray);
        });
    });

}

function refreshContacts(usersArray) {
    usersArray.forEach((item) => {
        if (connectedUsers.includes(item)) {
            getContacts(item);
        }
    });
}

http.listen(port, () => {
    console.log("Server Listening at port: " + port);
});