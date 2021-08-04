export class SendMessageModel {
    constructor(
        public username: String,
        public contactUsername: String,
        public message: String,
        public messageType: String,
        public messageTime: String
    ) { }
}