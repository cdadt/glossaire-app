import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../environments/environment';
import { AuthenticationService } from './authentication.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor(private http: HttpClient,
              private syncService: SyncService,
              private authService: AuthenticationService,
              private toastr: ToastrService) {}

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
  getThemeById(id: string): Promise<any> {
    return this.http.get(`${environment.apiUrl}/themes/${id}`)
      .toPromise();
  }

  /**
   * Récupère un theme par l'id d'un mot
   */
  getThemeByWordId(id): Promise<object> {
    return this.http.get(`${environment.apiUrl}/themes/word/${id}`)
      .toPromise();
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

  /**
   * Ajoute un thème et ses informations dans la BDD
   * @param theme La liste des infos du mot
   */
  addTheme(theme: object): void {
    this.http.post(`${environment.apiUrl}/themes`, theme, { headers:
      {
          Authorization: `Bearer ${ this.authService.getToken() }`
      }})
          .subscribe(
              success => {
                  this.toastr.success('La requête à bien été envoyée');
              },
              error => {
                  let errorMess = error.error;

                  if (typeof errorMess !== 'string') {
                      errorMess = '';
                  }

                  if (!this.syncService.getIsOnline()) {
                      errorMess = 'Vous êtes hors connexion.';
                  }

                  this.toastr.error(`La requête n\'a pas pu être envoyé. ${errorMess} `);
              }
          );
  }
}
