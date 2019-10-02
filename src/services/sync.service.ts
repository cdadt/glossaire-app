import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from './authentication.service';
import { IndexedDbService } from './indexed-db.service';
import { NotificationService } from './notification.service';
import { OnlineOfflineService } from './online-offline.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  private isOnline: boolean = navigator.onLine;

  constructor(private http: HttpClient,
              private readonly onlineOfflineService: OnlineOfflineService,
              private indexedDBService: IndexedDbService,
              private toastr: ToastrService,
              private authService: AuthenticationService,
              private notificationService: NotificationService) {
    if (this.isOnline) {
      this.indexedDBService.sendStockedQueries();
    }
    this.checkBackOnline();
  }

  /**
   * Détermine le type de traitement de la requête selon si l'on est connecté ou non.
   * @param query: la requête à ajouter.
   */
  howToAdd(query: any): void {
    if (this.isOnline) {
      this.addOnline(query);
    } else {
      this.addOffline(query);
    }
  }

  getIsOnline(): boolean {
      return this.isOnline;
  }

  /**
   * Ajoute la requête dans l'indexedDb pour traitement ultérieur.
   * @param query: la requête à ajouter à l'indexedDb.
   */
  private addOffline(query: any): void {
    this.toastr.warning('La requête sera envoyée ultérieurement', 'Mode hors ligne');
    this.indexedDBService.addToIndexedDb(query);
  }

  /**
   * Lance la requête au serveur.
   * @param query: la requête à envoyer.
   */
  private addOnline(query: any): void {
    this.http.post(query.url, query.params, query.option)
        .subscribe(
            success => {
                if (query.params.definition) {
                    this.notificationService.send(JSON.parse(query.params.get('wordInfo')).title, this.authService.getUserDetails().username)
                    .subscribe();
                }

                this.toastr.success('La requête à bien été envoyée');
            },
            error => {
                this.toastr.error('La requête n\'a pas pu être envoyé');
            }
        );
  }

  /**
   * Méthode qui souscrit au listener du onlineOfflineService pour gérer les changements d'état de la connexion internet.
   */
  private checkBackOnline(): void {
    this.onlineOfflineService.getIsOnline()
        .subscribe(online => {
          if (online) {
            this.toastr.success('En ligne', 'Etat de la connexion', {timeOut: 3000});
            this.isOnline = true;
            this.indexedDBService.sendStockedQueries();
          } else {
            this.toastr.error('Hors ligne', 'Etat de la connexion');
            this.isOnline = false;
          }
    });
  }

}
