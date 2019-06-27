import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

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

  constructor(private http: HttpClient, private router: Router) {
  }

  logout(): void {
    this.token = '';
    window.localStorage.removeItem('glossaire-token');
    this.router.navigateByUrl('/');
  }

  /**
   * Retourne un jeton de type UserDetails ou null
   */
  getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      // atob est utilisé pour décoder le token (qui n'est donc pas chiffré)
      payload = window.atob(payload);

      return JSON.parse(payload);
    } else {
      return undefined;
    }
  }

  /**
   * Vérifie le jeton et la date d'expiration, pour s'assurer que l'utilisateur est bien connecté
   * Si la date est arrivée à expiration, l'utilisateur est déconnecté
   */
  isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  /**
   * Méthode permettant d'enregistrer un utilisateur
   * Elle utilise la fonction request pour l'appel au backend et effectuer les actions
   * @param user l'utilisateur à enregistrer
   */
  register(user: TokenPayload): Promise<any> {
    return this.http.post(`${environment.apiUrl}/users`, user, {
      headers:
        {
          Authorization: `Bearer ${ this.getToken() }`
        }
    })
    .toPromise();
  }

  /**
   * Méthode permettant de connecter un utilisateur
   * Elle utilise la fonction request pour l'appel au backend et effectuer les actions
   * @param user l'utilisateur à connecter
   */
  async login(user: TokenPayload): Promise<boolean> {
    try {
      const data = (await this.http.post(`${environment.apiUrl}/jwt/generate`, user)
        .toPromise()) as TokenResponse;

      if (data.token) {
        this.saveToken(data.token);
      }

      return true;
    } catch {
      return false;
    }
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
}
