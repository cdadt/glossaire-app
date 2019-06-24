import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

// Les interfaces nécessaires
export interface UserDetails {
  _id: string;
  email: string;
  username: string;
  exp: number;
  iat: number;
}

interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  username: string;
  email?: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private token: string;
  uri = 'https://azaguilla.alwaysdata.net';
  // uri = 'http://localhost:4000';
  constructor(private http: HttpClient, private router: Router) {
  }

  private saveToken(token: string): void {
    localStorage.setItem('glossaire-token', token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('glossaire-token');
    }
    return this.token;
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('glossaire-token');
    this.router.navigateByUrl('/');
  }

  /**
   * Retourne un jeton de type UserDetails ou null
   */
  public getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      // atob est utilisé pour décoder le token (qui n'est donc pas chiffré)
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  /**
   * Vérifie le jeton et la date d'expiration, pour s'assurer que l'utilisateur est bien connecté
   * Si la date est arrivée à expiration, l'utilisateur est déconnecté
   */
  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  /**
   * Utilisée pour empêcher la duplication de code
   * Cette méthode effectue une requête en fonction de la méthode et du type de demande effectuée
   * @param method Requête HTTP (get ou post)
   * @param type   Le nom de l'action (login, register)
   * @param user   L'utilisateur authentifié
   */
  private request(method: 'post' | 'get', type: 'login' | 'register' | 'profile', user?: TokenPayload): Observable<any> {
    let base;

    if (method === 'post') {
      base = this.http.post(`${this.uri}/user/${type}`, user);
    } else {
      base = this.http.get(`${this.uri}/user/${type}`, {headers: {Authorization: `Bearer ${this.getToken()}`}});
    }

    // map fait partie de RXJS et est utilisé pour intercepter et stocker le jeton
    const request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        return data;
      })
    );

    return request;
  }

  /**
   * Méthode permettant d'enregistrer un utilisateur
   * Elle utilise la fonction request pour l'appel au backend et effectuer les actions
   * @param user l'utilisateur à enregistrer
   */
  public register(user: TokenPayload): Observable<any> {
    return this.request('post', 'register', user);
  }

  /**
   * Méthode permettant de connecter un utilisateur
   * Elle utilise la fonction request pour l'appel au backend et effectuer les actions
   * @param user l'utilisateur à connecter
   */
  public login(user: TokenPayload): Observable<any> {
    return this.request('post', 'login', user);
  }
}
