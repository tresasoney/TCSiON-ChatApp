import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ContactModel } from '../models/contact.model';
import { WebSocketService } from '../services/socket/web-socket.service';
import { UserauthService } from '../services/userauth.service';
import { ChatboxComponent } from './chatbox/chatbox.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild(ChatboxComponent) child!: ChatboxComponent;

  constructor(private router: Router, public userAuth: UserauthService, private webSocket: WebSocketService, private _snackBar: MatSnackBar) { }

  newMessageSnackBar(contactName: string) {
    this._snackBar.open('@' + contactName + ' sent you a message', '', {
      duration: 5000,
    });
  }

  logout() {
    this.userAuth.logOutUser();
    this.router.navigate(['/login']);
  }

  searchItem = new FormControl('');
  searchResults: ContactModel[] = [];
  searchLoadingEnable = false;
  searchUser() {
    this.viewSearchResults = true;
    this.searchLoadingEnable = true;
    this.searchResults = [];
    if (this.searchItem.value.length >= 3) {
      this.userAuth.userSearch(this.searchItem.value).subscribe(data => {
        if (data.users) {
          this.searchLoadingEnable = false;
          this.searchResults = data.users;
        }
        this.searchLoadingEnable = false;
      });
    }
  }
  selectContactFromSearch(searchContact: ContactModel) {
    console.log(this.contacts.filter(contact => contact.username === searchContact.username));
    this.selectedContact = this.contacts.filter(contact => contact.username === searchContact.username)[0];
    setTimeout(() => {
      this.refreshchild(this.selectedContact);
    }, 100);
  }

  contacts: ContactModel[] = [];
  noContacts = false;
  mutedContacts: string[] = [];
  blockedContacts: string[] = [];
  spinnerEnabled: boolean = true;
  loadContacts() {
    this.spinnerEnabled = true;
    this.webSocket.emit('send contacts request', (localStorage.getItem('username')));
    this.webSocket.listen('receive contacts').subscribe((data: any) => {
      if (data.message == "success") {
        this.contacts = data.contacts;
        console.log(this.contacts)
        console.log(this.selectedContact)
        this.mutedContacts = data.mutedContacts;
        this.blockedContacts = data.blockedContacts;
        this.noContacts = false;
        if (!data.contacts[0]) {
          this.noContacts = true;
        }
        this.spinnerEnabled = false;
      }
    })
  }

  onlineContacts: ContactModel[] = [];
  loadOnlineContacts() {
    this.userAuth.getOnlineContacts().subscribe(data => {
      if (data.message == "success") {
        this.onlineContacts = data.contacts;
      }
    });
  }

  selectedContact = new ContactModel('', '', '', '');
  selectContact(contact: ContactModel) {
    this.selectedContact = contact;
    setTimeout(() => {
      this.refreshchild(this.selectedContact);
    }, 100);
  }

  refreshchild(contact: any) {
    this.child.ngOnInit()
  }

  addNewContact(contact: ContactModel) {
    this.userAuth.addContactToBoth(contact.username).subscribe(status => {
      if (status.message == "success") {
        this.loadContacts();
      }
    });
  }

  consolefunction() {
    console.log('here from parent')
  }

  test() {
    console.log(this.searchItem.value);
  }

  checkSearchResInContacts(name: string) {
    return !!this.contacts.filter(contact => contact.username == name).length
  }

  viewSearchResults: boolean = false;
  hideSearchResults() {
    setTimeout(() => {
      this.viewSearchResults = false;
    }, 300);
  }

  profilePicture: string = '';

  ngOnInit(): void {
    this.webSocket.listen('get profile picture').subscribe((data: any) => {
      this.profilePicture = data.picture;
    })
    this.loadContacts();
    this.loadOnlineContacts();
    this.webSocket.emit('id', localStorage.getItem('username'));
    this.webSocket.listen('new message received').subscribe((data: any) => {
      this.newMessageSnackBar(data.contactName);
    });
    this.webSocket.listen('refresh online contacts').subscribe(status => {
      this.loadOnlineContacts();
    })

  }

}
