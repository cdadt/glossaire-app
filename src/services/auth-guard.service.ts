import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthenticationService} from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private auth: AuthenticationService, private router: Router) {
  }

  /**
   * Si l'authentification n'est pas effectuée, on redirige l'utilisateur vers la page de connexion
   */
  canActivate() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/connexion');
      return false;
    }
    return true;
  }
}
