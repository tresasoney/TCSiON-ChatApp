import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserauthService {

  constructor(private http: HttpClient) { }

  localhostAddress() {
    return 'http://localhost:3000/';
  }

  initiateMailVerification(email: string) {
    return this.http.post<any>('http://localhost:3000/email/initiateMailVerification', { "email": email });
  }

  verifyMailOtp(email: string, otp: string) {
    return this.http.post<any>('http://localhost:3000/email/verifyMailOtp', { "email": email, "otp": otp });
  }

  signUpUser(user: UserModel) {
    return this.http.post<any>('http://localhost:3000/users/signup', { "user": user });
  }

  loginUser(username: string, password: string) {
    return this.http.post<any>('http://localhost:3000/users/login', { "username": username, "password": password });
  }

  dupeUsernameCheck(username: string) {
    return this.http.post<any>('http://localhost:3000/users/dupeUsernameCheck', { "username": username });
  }

  dupeEmailCheck(email: string) {
    return this.http.post<any>('http://localhost:3000/users/dupeEmailCheck', { "email": email });
  }

  userSearch(username: string) {
    return this.http.post<any>('http://localhost:3000/users/searchuser', { "username": username });
  }

  addContactToBoth(contact: string) {
    return this.http.post<any>('http://localhost:3000/users/addContactToBoth', { "firstUsername": localStorage.getItem('username'), "secondUsername": contact });
  }

  getContacts() {
    let id = localStorage.getItem('id');
    return this.http.post<any>('http://localhost:3000/users/getContacts', { "id": id });
  }

  getOnlineContacts() {
    let id = localStorage.getItem('id');
    return this.http.post<any>('http://localhost:3000/users/getOnlineContacts', { "id": id });
  }

  muteBlockStatus(contactUsername: string) {
    let id = localStorage.getItem('id');
    return this.http.post<any>('http://localhost:3000/users/MuteBlockStatus', { "id": id, "contactUsername": contactUsername });
  }

  toggleBlock(contactUsername: string) {
    let id = localStorage.getItem('id');
    return this.http.post<any>('http://localhost:3000/users/toggleBlock', { "id": id, "contactUsername": contactUsername });
  }

  toggleMute(contactUsername: string) {
    let id = localStorage.getItem('id');
    return this.http.post<any>('http://localhost:3000/users/toggleMute', { "id": id, "contactUsername": contactUsername });
  }



  loginStatus() {
    if (localStorage.getItem('id') && localStorage.getItem('token') && localStorage.getItem('username')) {
      return true;
    }
    else if (!(!!localStorage.getItem('id') && !!localStorage.getItem('token') && !!localStorage.getItem('username'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      localStorage.removeItem('username');
      return false;
    }
    else {
      return false;
    }
  };

  logOutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
  }

}
