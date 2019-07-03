import { AuthenticationService } from './authentication.service';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SwPush } from '@angular/service-worker';

@Injectable()
export class NotificationService {
  readonly VAPID_PUBLIC_KEY = 'BNGmdT-zn-S0tocFwPP9Z6PG3pfouwebPHQ0lpAQg5Z5LLZJ4OdBXz8aN_ct19Bbvi56WeYosu94RCXS34D2NU0';

  private isSubscriber: string;
  private subscription: any | string;
  private errorWhenSubscribe = false;
  private notification: boolean;

  constructor(private http: HttpClient,
              private authService: AuthenticationService,
              private swPush: SwPush) {

  }

  /**
   * On enregistre le nouvel abonné dans la BDD
   * @param sub L'abonnement push au format json
   */
  addPushSubscriber(sub: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/notifications/subscribers`, sub);
  }

  /**
   * Méthode permettant de supprimer une subscription
   * @param endpoint Le endpoint de l'objet subscription
   */
  deletePushSubscriber(endpoint: any): Observable<any> {
    /*
     * Le endpoint étant une url et que seulement la dernière partie nous intéresse, on découpe cette url
     * en un tableau et on récupère le dernier élément
     */
    const endpointArr = endpoint.split('/');
    const idEndpoint = endpointArr[endpointArr.length - 1];

    return this.http.delete<any>(`${environment.apiUrl}/notifications/subscribers/${idEndpoint}`);
  }

  /**
   * On envoie le message à tous les abonnés
   */
  send(title, user): Observable<any> {
    const object = {
      title,
      user
    };

    return this.http.post<any>(`${environment.apiUrl}/notifications`, object);
  }

  /**
   * Méthode qui teste si l'abonnement existe ou non. En fonction du résultat, sera affiché un bouton "S'abonner" ou "Se désabonner"
   * @param pushSubscription Objet subscription
   */
  isSubscribe(pushSubscription): void {
    console.log(pushSubscription);
    if (pushSubscription === null) {
      this.isSubscriber = 'false';
    } else {
      this.subscription = pushSubscription.endpoint;
      this.isSubscriber = 'true';
    }
  }

  /**
   * Demande au service web push d'inscrire la personne aux notification en générant une subscription "sub"
   */
  subscribeToNotifications(): void {
    this.isSubscriber = 'loading';
    // On inscrit la personne
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
        .then(
          sub => this.subscriptionSuccessful(sub)
          , err => this.errorWhenSubscribe = true
        );
  }

  /**
   * Méthode permettant de désinscrire le naviagteur aux notifications. Puis on utilise la fonction unsubscriptionSuccessful
   * pour supprimer l'entrée concernant l'abonnement dans la Base de Données
   */
  async unsubscribeToNotifications(): Promise<any> {
    // On désinscrit la personne
    await (await navigator.serviceWorker.getRegistration()).pushManager.getSubscription().then(
        pushSubscription => pushSubscription.unsubscribe()).then(
        success => this.unsubscriptionSuccessful()
    );
  }

  /**
   * Méthode permettant d'afficher le message de succès lors d'une tentative d'abonnement qui aurait réussi
   * Puis envoie la subscription pour enregistrement dans la Base de données
   * @param sub L'objet subscription
   */
  subscriptionSuccessful(sub): void {
    // On indique à la page que la personne s'est abonnée et on lui renseigne le endpoint si jamais la personne souhaite
    // se désabonner. Puis on l'inscrit dans la Base de Données
    this.errorWhenSubscribe = false;
    this.isSubscriber = 'true';
    this.subscription = sub.endpoint;
    this.addPushSubscriber(sub).subscribe();
  }

  /**
   * Méthode permettant de supprimer l'entrée d'une personne abonnée dans la Base de Données
   */
  unsubscriptionSuccessful(): void {
    this.isSubscriber = 'false';
    this.deletePushSubscriber(this.subscription).subscribe();
  }

  /**
   * Méthode qui vérifie la compatibilité des navigateurs pour l'utilisation des notifications
   */
  async isBrowserCompatibleToNotif(): Promise<any> {
    // vérifie si le navigateur n'est pas Safari, si c'est le cas, vérifie que le navigateur supporte les
    // notifications et enfin si le navigateur est inscrit aux notifications
    if (window.navigator.userAgent.indexOf('Safari') > -1 && window.navigator.userAgent.indexOf('Chrome') === -1) {
      this.notification = false;
    } else {
      if (('Notification' in window)) {
        this.notification = true;
        await (await navigator.serviceWorker.getRegistration()).pushManager.getSubscription()
            .then(
            pushSubscription => this.isSubscribe(pushSubscription))
            .catch(err => console.log(err));
      } else {
        this.notification = false;
      }
    }
  }

  getIsSubscriber(): any {
    return this.isSubscriber;
  }

  getErrorWhenSubscribe(): boolean {
    return this.errorWhenSubscribe;
  }

  getNotification(): boolean {
    return this.notification;
  }

}
