import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserauthService } from '../services/userauth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router, public userAuth: UserauthService) { }

  logout() {
    this.userAuth.logOutUser();
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
  }

}
