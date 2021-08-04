import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserauthService } from './services/userauth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userAuth: UserauthService, private router: Router) { }
  canActivate(): boolean {
    if (!this.userAuth.loginStatus()) {
      this.router.navigate(['/login']);
    }
    return this.userAuth.loginStatus();
  }

}
