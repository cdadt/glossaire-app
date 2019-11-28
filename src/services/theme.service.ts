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

  constructor(private http: HttpClient,
              private syncService: SyncService,
              private authService: AuthenticationService,
              private toastr: ToastrService) {
  }

    /**
     * Permet de mettre à jour la liste complète des thèmes
     */
  async getThemesOnOpen(): Promise<any> {
      return await this.getThemes() as Array<Theme>;
  }

  /**
   * Récupère tous les thèmes
   */
  getThemes(pubOption = ''): Promise<object> {
    return this.http.get(`${environment.apiUrl}/themes`, {
        params: { pubOption }
    })
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
     * @param pubOption L'option de recherche sur le champ publication si besoin, à ajouter :
     * 'true' (avec publication 'true'), 'false' (avec publication 'false'), laissé à vide (sans le paramètre publication)
     */
  getThemesLikeByTitle(title: string, pubOption = ''): Promise<object> {
    return this.http.get(`${environment.apiUrl}/themes/search`, {
        params: { title, pubOption }
      })
      .toPromise();
  }

  /**
   * Ajoute un thème et ses informations dans la BDD
   * @param theme La liste des infos du mot
   */
  async addTheme(theme): Promise<void> {
      const queryType = 'post';
      this.syncService.howToAdd({
          url: `${environment.apiUrl}/themes`,
          params: { theme, queryType },
          option: {
              headers:
                  {
                      Authorization: `Bearer ${ this.authService.getToken() }`
                  }
          }
      });
  }

    /**
     * Méthode permettant de supprimer un thème
     * @param theme L'id du thème à supprimer
     */
  deleteOneTheme(themeId): void {
    const queryType = 'delete';
    this.syncService.howToAdd({
        url: `${environment.apiUrl}/themes`,
        params: { themeId, queryType },
        option: {
            headers:
                {
                    Authorization: `Bearer ${ this.authService.getToken() }`
                }
        }
    });
  }

    /**
     * Méthode permettant de publier ou dépublier un thème
     * @param themeId L'id du thème à modifier
     * @param themePub L'état de publication à appliquer
     */
  publishedOneTheme(themeId, themePub): void {
      this.http.patch(`${environment.apiUrl}/themes/published`, {
          headers: { Authorization: `Bearer ${ this.authService.getToken() }` },
          params : { themeId, themePub }
      })
          .subscribe();
  }

    /**
     * Méthode permettant de modifier un thème
     * @param theme Le thème à éditer avec ses informations
     */
  async editOneTheme(theme): Promise<any> {
        return this.http.put(`${environment.apiUrl}/themes`, theme, {
            headers: { Authorization: `Bearer ${ this.authService.getToken() }` }
        })
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

    this.toastr.error(`La requête n\'a pas aboutie. ${errorMess} `);
    }
}
