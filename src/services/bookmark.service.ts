import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../environments/environment';
import { AuthenticationService } from './authentication.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {

  constructor(private syncService: SyncService,
              private toastr: ToastrService,
              private http: HttpClient,
              private authService: AuthenticationService) {}

  /**
   * Méthode permettant d'ajouter un favori
   * @param userID L'id de l'utilisateur souhaitant ajouter un favori
   * @param bookmark Le favori à ajouter au format JSON
   */
  async addBookmark(userID, bookmark): Promise<void> {
    const params = { bookmark, userID };

    const queryType = 'post';
    this.syncService.howToAdd({
      url: `${environment.apiUrl}/users/bookmark`,
      params: { params, queryType },
      option: {
        headers:
            {
              Authorization: `Bearer ${ this.authService.getToken() }`
            }
      }
    });
  }

  /**
   * Méthode permettant de supprimer un favori
   * @param userID L'id de l'utilisateur souhaitant supprimer le favori
   * @param wordID L'id du mot à supprimer
   */
  async deleteBookmark(userID, wordID): Promise<void> {
    const queryType = 'delete';
    this.syncService.howToAdd({
      url: `${environment.apiUrl}/users/bookmark`,
      params: { wordID, userID, queryType },
      option: {
        headers:
            {
              Authorization: `Bearer ${ this.authService.getToken() }`
            }
      }
    });
  }

  verifyBookmarkPresence(userID, wordID): Promise<any> {
    return this.http.get(`${environment.apiUrl}/users/bookmarkpresence`, {
      headers: { Authorization: `Bearer ${ this.authService.getToken() }` },
      params : { wordID, userID }
    })
        .toPromise();
  }

  /**
   * Méthode permettant d'afficher les erreurs retournées par le backend
   * @param error Le message d'erreur à afficher
   */
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
