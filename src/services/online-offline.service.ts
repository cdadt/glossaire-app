import { Injectable } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineOfflineService {

  private isOnline = new Subject<boolean>();

  constructor() {
    const online = fromEvent(window, 'online');
    online.subscribe(
        () => { this.updateOnlineStatus(); },
        (error) => {console.log('Erreur bordel :' + error); },
        () => {console.log('Ok terminé'); }
    );

    // On place un observer sur l'evenement OFFLINE du navigateur
    const offline = fromEvent(window, 'offline');
    offline.subscribe(
        () => { this.updateOnlineStatus(); },
        (error) => {console.log('Erreur bordel :' + error); },
        () => {console.log('Ok terminé'); }
    );
  }

  public getIsOnline() {
    return this.isOnline.asObservable();
  }

  private updateOnlineStatus() {
    this.isOnline.next(window.navigator.onLine);
  }
}
