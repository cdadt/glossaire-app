import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class WordService {
  constructor(private http: HttpClient,
              private syncService: SyncService
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
   */
  getWordsLikeByTitle(title: string): Promise<object> {
    return this.http.get(`${environment.apiUrl}/words/search`, {
        params: { title }
      })
      .toPromise();
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
      url: `${environment.apiUrl}/word/add`,
      params: word
    });
    // return this.http.post(`${environment.apiUrl}/words`, word)
    //   .toPromise();
  }
}
