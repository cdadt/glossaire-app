import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {formatDate} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  uri = 'https://azaguilla.alwaysdata.net';
  // uri = 'http://localhost:4000';
  constructor(private http: HttpClient) {
  }

  /**
   * Récupère tous les thèmes
   */
  getThemes() {
    return this.http.get(`${this.uri}/theme`);
  }

  /**
   * Récupère un theme par son id
   */
  getThemeById(id) {
    return this.http.get(`${this.uri}/theme/${id}`, );
  }

  /**
   * Récupère un theme par l'id d'un mot
   */
  getThemeByWordId(id) {
    return this.http.get(`${this.uri}/theme/word/${id}`, );
  }

  /**
   *
   * @param title Le thème à rechercher
   */
  getThemesLikeByTitle(title) {
    return this.http.get(`${this.uri}/theme/search/${title}`, );
  }
}
