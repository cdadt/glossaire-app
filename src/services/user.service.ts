import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";
import {AuthenticationService, TokenPayload} from "./authentication.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,
              private authenticationService: AuthenticationService) { }

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

}
