import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthEditorGuardService {

  constructor(private authService: AuthenticationService, private router: Router) { }

  /**
   * Si l'authentification n'est pas effectuée, on redirige l'utilisateur vers la page de connexion
   * Si l'utilisateur connecté n'as pas les droits nécéssaires, on le redirige sur la page d'accueil
   */
  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/connexion');

      return false;
    } else if (this.authService.getUserDetails().permissions < 2) {
      this.router.navigateByUrl('');

      return false;
    }

    return true;
  }
}
