import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthenticationService } from './authentication.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class WordService {
  constructor(private http: HttpClient,
              private syncService: SyncService,
              private authService: AuthenticationService
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
    if (Object.keys(existWord).length > 0) {
      return true;
    }

    return false;
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
   * @param word La liste des infos du mot
   */
  addWord(word: object): void {
    this.syncService.howToAdd({
      url: `${environment.apiUrl}/words`,
      params: word,
      option: {
        headers:
            {
              Authorization: `Bearer ${ this.authService.getToken() }`
            }
      }
    });
  }
}
