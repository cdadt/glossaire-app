import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import Theme from '../app/models/theme.model';
import { environment } from '../environments/environment';
import { AuthenticationService } from './authentication.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  themes: Array<Theme>;
  themesSubject = new Subject<Array<Theme>>();

  constructor(private http: HttpClient,
              private syncService: SyncService,
              private authService: AuthenticationService,
              private toastr: ToastrService) {
      this.getThemesOnOpen()
          .then(
          () => this.emitThemes()
      );
  }

  async getThemesOnOpen(): Promise<void> {
      this.themes = await this.getThemes() as Array<Theme>;
  }

  emitThemes(): void {
        this.themesSubject.next(this.themes);
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
                  this.getThemesOnOpen()
                      .then(
                          () => this.emitThemes()
                      );
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

    /**
     * Méthode permettant de supprimer un thème
     * @param theme L'id du thème à supprimer
     */
  deleteOneTheme(theme): void {
      this.http.delete(`${environment.apiUrl}/themes`, {
        headers: { Authorization: `Bearer ${ this.authService.getToken() }` },
        params : { themeId: theme}
      })
          .subscribe(
              success => {
                  this.getThemesOnOpen()
                      .then(
                      () => this.emitThemes()
                  );
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
