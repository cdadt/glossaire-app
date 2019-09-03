import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../environments/environment';
import { AuthenticationService } from './authentication.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class WordService {
  constructor(private http: HttpClient,
              private syncService: SyncService,
              private authService: AuthenticationService,
              private toastr: ToastrService
  ) {}

  /**
   * Récupère la dernière définition ajoutée en passant par le serveur nodejs
   */
  getLastWord(): Promise<object> {
    return this.http.get(`${environment.apiUrl}/words/last`)
      .toPromise();
  }

  /**
   * Récupère un mot et ses infos par son id
   * @param id L'id de la définition
   */
  getWordById(id: String): Promise<object> {
    return this.http.get(`${environment.apiUrl}/words/${id}`)
      .toPromise();
  }

  /**
   * Récupère une liste de mot pour la recherche
   * @param title Le mot à rechercher
   * @param pubOption L'option de publication. Aucune si laissé vide
   */
  getWordsLikeByTitle(title: string, pubOption = ''): Promise<object> {
    return this.http.get(`${environment.apiUrl}/words/search`, {
        params: { title, pubOption }
      })
      .toPromise();
  }

  getWordByExactTitle(title: string): Promise<object> {
    return this.http.get(`${environment.apiUrl}/words/search-exact`, {
      params: { title }
    })
        .toPromise();
  }

  async existWordTitle(title: string): Promise<boolean> {
    const existWord = await this.getWordByExactTitle(title.trim());

    return Object.keys(existWord).length > 0;
  }

  /**
   * Récupère une liste de définitions appartenant à un thème
   * @param id l'id du thème
   */
  getWordsForATheme(id: string): Promise<object> {
    return this.http.get(`${environment.apiUrl}/themes/${id}/words`)
      .toPromise();
  }

  /**
   * Ajoute une définition et ses informations dans la BDD
   * @param formData Le formData contenant l'image et les informations du mot
   */
  addWord(formData): void {
    this.syncService.howToAdd({
      url: `${environment.apiUrl}/words`,
      params: formData,
      option: {
        headers:
            {
              Authorization: `Bearer ${ this.authService.getToken() }`
            }
      }
    });
  }

  /**
   * Méthode permettant de publier ou dépublier un mot
   * @param wordId L'id du mot à modifier
   * @param wordPub L'état de publication à appliquer
   */
  publishedOneWord(wordId, wordPub): Promise<any> {
    return this.http.patch(`${environment.apiUrl}/words/published`, {
      headers: { Authorization: `Bearer ${ this.authService.getToken() }` },
      params : { wordId, wordPub }
    })
        .toPromise();
  }

  /**
   * Méthode permettant de valider ou invalider un mot
   * @param wordId L'id du mot à modifier
   * @param wordVali L'état de validation à appliquer
   */
  validateOneWord(wordId, wordVali): Promise<any> {
    return this.http.patch(`${environment.apiUrl}/words/validate`, {
      headers: { Authorization: `Bearer ${ this.authService.getToken() }` },
      params : { wordId, wordVali }
    })
        .toPromise();
  }

  deleteOneWord(wordId): void {
    this.http.delete(`${environment.apiUrl}/words`, {
      headers: { Authorization: `Bearer ${ this.authService.getToken() }` },
      params : { wordId }
    })
        .subscribe(
            success => {
              //
            },
            error => this.errorActions(error)
        );
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
