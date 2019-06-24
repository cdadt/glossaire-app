import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {formatDate} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WordService {

  uri = 'https://azaguilla.alwaysdata.net';
  // uri = 'http://localhost:4000';
  constructor(private http: HttpClient) {
  }

  /**
   * Récupère la dernière définition ajoutée en passant par le serveur nodejs
   */
  getLastWord() {
    return this.http.get(`${this.uri}/word`);
  }

  /**
   * Récupère un mot et ses infos par son titre
   * @param title Le titre de la définition
   */
  getWordByTitle(title) {
    return this.http.get(`${this.uri}/word/${title}`, );
  }


  /**
   * Récupère une liste de mot pour la recherche
   * @param title Le mot à rechercher
   */
  getWordsLikeByTitle(title) {
    return this.http.get(`${this.uri}/word/search/${title}`, );
  }

  /**
   * Récupère une liste de définitions appartenant à un thème
   * @param title Le titre du thème
   */
  getWordsByThmTitle(title) {
    return this.http.get(`${this.uri}/word/thm/${title}`, );
  }

  /**
   * Ajoute une définition et ses informations dans la BDD
   * @param wordInfo La liste des infos du mot
   */
  addWord(wordInfo) {
    this.http.post(`${this.uri}/word/add`, wordInfo).subscribe(res => console.log('Done'));
  }
}
