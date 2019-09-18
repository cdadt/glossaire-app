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
  addBookmark(userID, bookmark): Promise<any> {
    const params = { bookmark, userID };

    return this.http.post(`${environment.apiUrl}/users/bookmark`, params, {
      headers: { Authorization: `Bearer ${ this.authService.getToken() }` }
    })
        .toPromise();
  }

  /**
   * Méthode permettant de supprimer un favori
   * @param userID L'id de l'utilisateur souhaitant supprimer le favori
   * @param wordID L'id du mot à supprimer
   */
  deleteBookmark(userID, wordID): Promise<any> {
    return this.http.delete(`${environment.apiUrl}/users/bookmark`, {
      headers: { Authorization: `Bearer ${ this.authService.getToken() }` },
      params : { wordID, userID }
    })
        .toPromise();
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
