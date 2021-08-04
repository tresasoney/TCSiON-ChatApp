import { MessageModel } from "./message.model";

export class ChatModel {
    constructor(
        public firstUser: String,
        public secondUser: String,
        public chat: MessageModel[]
    ) { }
}