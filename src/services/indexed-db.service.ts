import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from './authentication.service';
import { NotificationService } from './notification.service';
import { UtilitaryService } from './utilitary.service';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {

  private db: any;

  constructor(private http: HttpClient,
              private toastr: ToastrService,
              private notificationService: NotificationService,
              private authService: AuthenticationService,
              private utilitaryService: UtilitaryService) {
    this.createDatabase();
  }

  /**
   * Méthode qui permet d'ajouter une requête dans l'indexedDB.
   * @param query: la requête à ajouter.
   */
  addToIndexedDb(query: any): void {
    this.db.queries.add(query)
        .catch(e => {
          console.log(`Erreur: ${(e.stack || e)}`);
    });
  }

  /**
   * Méthode qui permet de renvoyer toutes les requêtes stockées dans l'indexedDb.
   * Utilisée par le syncService lorsque l'application est de nouveau en ligne.
   * C'est le syncService qui vérifie l'état online avec le onlineOfflineService.
   */
  async sendStockedQueries(): Promise<any> {
    if (!(await this.emptyTable())) {
      this.toastr.warning('Tentative d\'envoi des requêtes', 'Récupération de la connexion');

      // ouverture d'une transaction en 'rw' sinon .each ouvre une transaction en readonly
      this.db.transaction('rw', this.db.queries, () => {
        this.db.queries.each((query: any) => {
          this.sendQuery(query)
              .then(() => {
                this.notificationService.send(query.params.title, this.authService.getUserDetails().username)
                    .subscribe();
                this.deleteItemFromIndexedDb(query);
          });
        })
            .then(() => {
              setTimeout(() => {
                this.toastr.success('Toutes les requêtes en attente ont été envoyées', 'Récupération de la connexion');
              }, 3000);
        });
      })
          .catch(() => {
            this.toastr.error('Un problème est survenu lors de l\'envoi des requêtes en attentes', 'Erreur');
      });
    }
  }

  /**
   * Méthode qui permet de supprimer une requête de l'indexedDb.
   * @param query: la requête à supprimer.
   */
  private deleteItemFromIndexedDb(query: any): void {
    this.db.queries.delete(query.id);
  }

  /**
   * Méthode qui crée la database pour stocker les requêtes dans l'indexedDb.
   */
  private createDatabase(): void {
    this.db = new Dexie('queriesDatabase');
    this.db.version(1)
        .stores({
          queries: '++id, query'
        });
  }

  /**
   * Méthode qui permet d'envoyer une requête http.
   * @param query: la requête à envoyer.
   */
  private async sendQuery(query: any): Promise<any> {
    this.utilitaryService.sendQuery(query);
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
