import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) {
  }

  /**
   * Si l'authentification n'est pas effectuée, on redirige l'utilisateur vers la page de connexion
   */
  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/connexion');

      return false;
    }

    return true;
  }
}
