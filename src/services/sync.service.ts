import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IndexedDbService } from './indexed-db.service';
import { OnlineOfflineService } from './online-offline.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  private isOnline: boolean = navigator.onLine;

  constructor(private http: HttpClient,
              private readonly onlineOfflineService: OnlineOfflineService,
              private indexedDBService: IndexedDbService,
              private toastr: ToastrService) {
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
    this.http.post(query.url, query.params)
        .subscribe();
    this.toastr.success('La requête à bien été envoyée');
  }

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
