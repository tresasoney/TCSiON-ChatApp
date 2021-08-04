import { Component, OnInit } from '@angular/core';
import { UserauthService } from 'src/app/services/userauth.service';

@Component({
  selector: 'app-select-chat',
  templateUrl: './select-chat.component.html',
  styleUrls: ['./select-chat.component.css']
})
export class SelectChatComponent implements OnInit {

  constructor(private userAuth: UserauthService) { }

  imageURL: string = "";
  ngOnInit(): void {
    this.imageURL = this.userAuth.localhostAddress() + '/images/start.png' + this.imageURL;
  }

}
