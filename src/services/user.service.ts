import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import User from '../app/models/user.model';
import { environment } from '../environments/environment';
import { AuthenticationService, TokenPayload } from './authentication.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,
              private authenticationService: AuthenticationService,
              private toastr: ToastrService,
              private syncService: SyncService) { }

  /**
   * Méthode permettant d'enregistrer un utilisateur
   * Elle utilise la fonction request pour l'appel au backend et effectuer les actions
   * @param user l'utilisateur à enregistrer
   */
  register(user: TokenPayload): Promise<any> {
    return this.http.post(`${environment.apiUrl}/users`, user, {
      headers:
          {
            Authorization: `Bearer ${ this.authenticationService.getToken() }`
          }
    })
        .toPromise();
  }

  /**
   * Méthode pour mettre à jour un utilisateur modifié.
   */
  update(user: User): void {
    this.http.post(`${environment.apiUrl}/users/update`, user, {
      headers:
          {
            Authorization: `Bearer ${ this.authenticationService.getToken() }`
          }
    })
        .subscribe(
            success => {
                this.toastr.success('La modification a été effectuée');
            },
            error => this.errorActions(error)
        );
  }

  /**
   * Récupère un utilisateur et ses infos par son id
   * @param id L'id de la définition
   */
  async getUserById(id: string): Promise<object> {
    return this.http.get(`${environment.apiUrl}/users/${id}`, {
      headers:
          {
            Authorization: `Bearer ${this.authenticationService.getToken()}`
          }
    })
        .toPromise();
  }

    /**
     * Récupère une liste de user pour la recherche
     * @param username Le user à rechercher
     */
  getUserLikeByUsername(username: string): Promise<object> {
    return this.http.get(`${environment.apiUrl}/users/search`, {
        params: { username },
        headers:
          {
            Authorization: `Bearer ${ this.authenticationService.getToken() }`
          }
    })
        .toPromise();
  }

  sendReinitiatePswEmail(email): Promise<object> {
      return this.http.patch(`${environment.apiUrl}/users/forgotten-psw`, { params : { email } })
          .toPromise();
  }

  changePassword(code, psw): Promise<object> {
      return this.http.patch(`${environment.apiUrl}/users/change-psw`, { params : { code, psw } })
          .toPromise();
  }

  verifResetPswCodeExists(code): Promise<object> {
      return this.http.get(`${environment.apiUrl}/users/verif-reset-psw-code/${code}`)
          .toPromise();
  }

  errorActions(error): void {
        let errorMess = error.error;

        if (typeof errorMess !== 'string') {
            errorMess = '';
        }

        if (!this.syncService.getIsOnline()) {
            errorMess = 'Vous êtes hors connexion.';
        }

        this.toastr.error(`La tentative a échouée. ${errorMess} `);
    }

}
