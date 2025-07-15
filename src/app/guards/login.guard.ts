import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
   providedIn: 'root'
})
export class LoginGuard implements CanActivate {
   constructor(
      private authService: AuthService,
      private router: Router
   ) { }

   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      if (!this.authService.isAuthenticated()) {
         return true;
      } else {
         // Só redirecionar se não estiver já na página inicial
         if (state.url !== '/') {
            this.router.navigate(['/']);
         }
         return false;
      }
   }
}
