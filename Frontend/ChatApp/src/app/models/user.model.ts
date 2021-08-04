export class UserModel {
    constructor(
        public _id: String,
        public firstName: String,
        public lastName: String,
        public email: String,
        public bio: String,
        public availability: String,
        public phone: String,
        public picture: String,
        public profileSettings: Array<25>,
        public username: String,
        public password: String,
        public contacts: Array<10000>,
        public mutedContacts:Array<10000>,
        public blockedContacts:Array<10000>
    ) { }
}