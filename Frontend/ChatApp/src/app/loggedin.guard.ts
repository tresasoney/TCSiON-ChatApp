import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserauthService } from './services/userauth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedinGuard implements CanActivate {

  constructor(private userAuth: UserauthService, private router: Router) { }
  canActivate(): boolean {
    if (this.userAuth.loginStatus()) {
      this.router.navigate(['']);
    }
    return !this.userAuth.loginStatus();
  }

}
