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

  /**
   * Récupère un mot par son titre
   * @param title Le mot à rechercher
   */
  getWordByExactTitle(title: string): Promise<object> {
    return this.http.get(`${environment.apiUrl}/words/search-exact`, {
      params: { title }
    })
        .toPromise();
  }

  /**
   * Retourne un booléen en fonction de la présence ou non d'un mot dont le titre est identique à celui renseigné.
   * @param title Le titre du mot à vérifier
   */
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
  addWord(wordInfo): void {
    const queryType = 'post';
    this.syncService.howToAdd({
      url: `${environment.apiUrl}/words`,
      params: { wordInfo, queryType },
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
  publishedOneWord(wordId, wordPub): void {
    const queryType = 'patch';
    this.syncService.howToAdd({
      url: `${environment.apiUrl}/words/published`,
      params: { wordId, wordPub, queryType },
      option: {
        headers:
            {
              Authorization: `Bearer ${ this.authService.getToken() }`
            }
      }
    });
  }

  /**
   * Méthode permettant de valider ou invalider un mot
   * @param wordId L'id du mot à modifier
   * @param wordVali L'état de validation à appliquer
   */
  async validateOneWord(wordId, wordVali): Promise<void> {
    const queryType = 'patch';
    this.syncService.howToAdd({
      url: `${environment.apiUrl}/words/validate`,
      params: { wordId, wordVali, queryType },
      option: {
        headers:
            {
              Authorization: `Bearer ${ this.authService.getToken() }`
            }
      }
    });
  }

  /**
   * Méthode permettant d'éditer un mot
   * @param formData Les données des formulaires
   */
  editWordElements(wordInfo): Promise<any> {
    return this.http.put(`${environment.apiUrl}/words/edit`, wordInfo, {
      headers: { Authorization: `Bearer ${ this.authService.getToken() }` }
    })
        .toPromise();
  }

  /**
   * Supprime un mot
   * @param wordId L'id du mot à supprimer
   */
  deleteOneWord(wordId): void {
    const queryType = 'delete';
    this.syncService.howToAdd({
      url: `${environment.apiUrl}/words`,
      params: { wordId, queryType },
      option: {
        headers:
            {
              Authorization: `Bearer ${ this.authService.getToken() }`
            }
      }
    });
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

  /**
   * Méthode permettant de compter le nombre de définition en attente de validation.
   */
  async countWaitingWord(): Promise<object> {
    return this.http.get(`${environment.apiUrl}/words/count-waiting`, {
      headers: { Authorization: `Bearer ${ this.authService.getToken() }` }
    })
        .toPromise();
  }

  /**
   * Méthode permettant de récupérer les définitions en attente de validation.
   */
  async getWaitingWords(): Promise<object> {
    return this.http.get(`${environment.apiUrl}/words/get-waiting`, {
      headers: { Authorization: `Bearer ${ this.authService.getToken() }` }
    })
        .toPromise();
  }
}
