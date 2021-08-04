import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ContactModel } from 'src/app/models/contact.model';
import { ChatModel } from 'src/app/models/chat.model';
import { SendMessageModel } from 'src/app/models/sendMessage.model';
import { WebSocketService } from 'src/app/services/socket/web-socket.service';
import { UserauthService } from 'src/app/services/userauth.service';
import { MessageModel } from 'src/app/models/message.model';
import * as moment from 'moment';


@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})

export class ChatboxComponent implements OnInit {

  @Input() contact = new ContactModel('', '', '', '');
  @Input() contacts: ContactModel[] = [];

  @Output() contactsrefresh = new EventEmitter();

  constructor(private userAuth: UserauthService, private webSocket: WebSocketService) { }


  newMessage = new FormControl('');
  uploadToggle: boolean = false;
  moment = moment()

  muted = false;
  blocked = false;

  getMuteBlockStatus() {
    this.userAuth.muteBlockStatus(this.contact.username).subscribe(status => {
      if (status.message == "success") {
        this.muted = status.muteStatus;
        this.blocked = status.blockStatus;
        if (!this.blocked) {
          this.joinChatAndRecieveMessages();
        }
        else {
          this.chatIsLoading = false;
        }
      }
    });
  }

  muteContact() {
    this.userAuth.toggleMute(this.contact.username).subscribe(status => {
      if (status.message == "success") {
        this.muted = status.muteStatus;
        this.contactsrefresh.emit();
      }
    });
  }

  blockContact() {
    this.userAuth.toggleBlock(this.contact.username).subscribe(status => {
      if (status.message == "success") {
        this.blocked = status.blockStatus;
        this.contactsrefresh.emit();
        if (!this.blocked) {
          this.chatIsLoading = true;
          this.joinChatAndRecieveMessages();
        }
      }
    });
  }
  messagesInChat: ChatModel = new ChatModel('', '', []);
  chatIsLoading: boolean = true;

  joinChatAndRecieveMessages() {
    this.webSocket.emit('join chat', this.contact.username);
    this.webSocket.listen('receive old messages').subscribe((chat: any) => {
      this.messagesInChat = chat;
      this.chatIsLoading = false;
    });
  }


  // Image Uploads 
  selectedImage!: FileList;
  imageSelected(element: any) {
    this.selectedImage = element.target.files;
    console.log(this.selectedImage)
  }

  sendImageSelected() {
    var file = this.selectedImage[0];
    var reader = new FileReader();
    reader.onload = this.readerLoaded.bind(this);
    reader.readAsBinaryString(file);
  }

  readerLoaded(evt: any) {
    var binaryString = evt.target.result;
    this.sendImageToSocketandPushtoChat(btoa(binaryString));
  }
  sendImageToSocketandPushtoChat(base64Image: string) {
    let messageToSend = new SendMessageModel(this.username, this.contact.username, base64Image, this.selectedImage[0].type, moment().format('lll'));
    this.webSocket.emit('send message', messageToSend);
    let message = { messageContent: messageToSend.message, messageType: messageToSend.messageType, messageSender: messageToSend.username, messageTime: messageToSend.messageTime };
    this.messagesInChat.chat.push(message);

  }

  optionsToggle: boolean = false;

  messageTimes: Number[] = []
  passMessage(data: any) {
    if (!this.messageTimes.includes(data.time)) {
      this.messageTimes.push(data.time);
      this.messagesInChat.chat.push(data.message);
    }
  }

  messageToForward = new MessageModel('', '', '', '');
  forwardMessage(contactUserName: string) {
    let messageToSend = new SendMessageModel(this.username, contactUserName, this.messageToForward.messageContent, this.messageToForward.messageType, moment().format('lll'));
    this.webSocket.emit('send message', messageToSend);
  }

  username = localStorage.getItem('username') || '';
  sendMessage() {
    if (this.newMessage.value.trim()) {
      let messageToSend = new SendMessageModel(this.username, this.contact.username, this.newMessage.value, 'text', moment().format('lll'));
      this.webSocket.emit('send message', messageToSend);
      let message = { messageContent: messageToSend.message, messageType: messageToSend.messageType, messageSender: messageToSend.username, messageTime: messageToSend.messageTime };
      this.messagesInChat.chat.push(message);
      this.newMessage.setValue('');
    }
  }

  enterPressed(event: any) {

  }

  ngOnInit(): void {
    this.messageTimes = [];
    this.messagesInChat.chat = [];
    this.chatIsLoading = true;
    this.getMuteBlockStatus();
    this.uploadToggle = false;
    this.newMessage.setValue('');
    console.log('here' + this.contact.username)
    this.webSocket.emit('join chat', this.contact.username);

    this.webSocket.listen('receive message from contact').subscribe((thing: any) => {
      this.passMessage(thing)
    });

  }


}
