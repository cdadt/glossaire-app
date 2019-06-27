import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor(private http: HttpClient) {
  }

  /**
   * Récupère tous les thèmes
   */
  getThemes(): Promise<object> {
    return this.http.get(`${environment.apiUrl}/themes`)
      .toPromise();
  }

  /**
   * Récupère un theme par son id
   */
  getThemeById(id): Promise<object> {
    return this.http.get(`${environment.apiUrl}/themes/${id}`)
      .toPromise();;
  }

  /**
   * Récupère un theme par l'id d'un mot
   */
  getThemeByWordId(id): Promise<object> {
    return this.http.get(`${environment.apiUrl}/themes/word/${id}`)
      .toPromise();;
  }

  /**
   *
   * @param title Le thème à rechercher
   */
  getThemesLikeByTitle(title: string): Promise<object> {
    return this.http.get(`${environment.apiUrl}/themes/search`, {
        params: { title }
      })
      .toPromise();
  }
}
