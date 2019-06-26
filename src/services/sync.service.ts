import { Injectable } from '@angular/core';
import {OnlineOfflineService} from './online-offline.service';
import {IndexedDbService} from './indexed-db.service';
import {HttpClient} from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

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
  public howToAdd(query: any) {
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
  private addOffline(query: any) {
    this.toastr.warning('La requête sera envoyée ultérieurement', 'Mode hors ligne');
    this.indexedDBService.addToIndexedDb(query);
  }

  /**
   * Lance la requête au serveur.
   * @param query: la requête à envoyer.
   */
  private addOnline(query: any) {
    this.toastr.success('La requête à bien été envoyée');
    this.http.post(query.url, query.params);
  }

  private checkBackOnline() {
    this.onlineOfflineService.getIsOnline().subscribe(online => {
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
