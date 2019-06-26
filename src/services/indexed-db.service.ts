import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import {HttpClient} from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {

  private db: any;

  constructor(private http: HttpClient, private toastr: ToastrService) {
    this.createDatabase();
  }

  /**
   * Méthode qui crée la database pour stocker les requêtes dans l'indexedDb.
   */
  private createDatabase() {
    this.db = new Dexie('queriesDatabase');
    this.db.version(1).stores({
      queries: '++id, query'
    });
  }

  /**
   * Méthode qui permet d'ajouter une requête dans l'indexedDB.
   * @param query: la requête à ajouter.
   */
  public addToIndexedDb(query: any) {
    this.db.queries.add(query).catch(e => {
      console.log('Erreur: ' + (e.stack || e));
    });
  }

  /**
   * Méthode qui permet de supprimer une requête de l'indexedDb.
   * @param query: la requête à supprimer.
   */
  private deleteItemFromIndexedDb(query: any) {
    this.db.queries.delete(query.id).then(() => {
      console.log('Requête supprimé de l\'indexedDb');
    });
  }

  /**
   * Méthode qui permet de renvoyer toutes les requêtes stockées dans l'indexedDb.
   * Utilisée par le syncService lorsque l'application est de nouveau en ligne.
   * C'est le syncService qui vérifie l'état online avec le onlineOfflineService.
   */
  public async sendStockedQueries() {
    if (!(await this.emptyTable())) {
      this.toastr.warning('Tentative d\'envoi des requêtes', 'Récupération de la connexion');

      // ouverture d'une transaction en 'rw' sinon .each ouvre une transaction en readonly
      this.db.transaction('rw', this.db.queries, () => {
        this.db.queries.each((query: any) => {
          this.sendQuery(query).then(() => {
            this.deleteItemFromIndexedDb(query);
          });
        }).then(() => {
          setTimeout(() => {
            this.toastr.success('Toutes les requêtes en attente ont été envoyées', 'Récupération de la connexion');
          }, 3000);
        });
      }).catch(() => {
        this.toastr.error('Un problème est survenu lors de l\'envoi des requêtes en attentes', 'Erreur');
      });
    }
  }

  /**
   * Méthode qui permet d'envoyer une requête http.
   * @param query: la requête à envoyer.
   */
  private async sendQuery(query: any) {
    this.http.post(query.url, query.params).subscribe();
  }

  /**
   * Détermine si l'indexedDB est vide ou non.
   */
  private async emptyTable(): Promise<any> {
    const count = await this.db.queries.count();

    if (count === 0) {
      return true;
    } else {
      return false;
    }
  }
}
