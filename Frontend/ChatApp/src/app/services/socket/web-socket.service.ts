import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  socket: any;

  constructor() {
    this.socket = io('ws://localhost:3000?username=' + localStorage.getItem('username'), { transports: ['websocket', 'polling', 'flashsocket'] })
  }


  listen(eventName: String) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      })
    })
  }

  emit(eventName: String, data: any) {
    this.socket.emit(eventName, data);
  }
}
