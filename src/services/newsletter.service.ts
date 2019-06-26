import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';



@Injectable()
export class NewsletterService {

  // uri = 'https://azaguilla.alwaysdata.net';
  uri = 'http://localhost:2223';
  constructor(private http: HttpClient) {

  }

  /**
   * On enregistre le nouvel abonné dans la BDD
   * @param sub L'abonnement push au format json
   */
  addPushSubscriber(sub: any) {
    return this.http.post<any>(`${this.uri}/notifications/subscribers`, sub);
  }

  /**
   * Méthode permettant de supprimer une subscription
   * @param endpoint Le endpoint de l'objet subscription
   */
  deletePushSubscriber(endpoint: any) {
    const sub = {
      endpoint
    };
    // return this.http.post<any>(`${this.uri}/notifications/subscribers/delete/`, sub);
    return this.http.delete<any>(`${this.uri}/notifications/subscribers/${sub.endpoint.id}`);
  }

  /**
   * On envoie le message à tous les abonnés
   */
  send(title, user) {
    const object = {
      title,
      user
    };
    return this.http.post<any>(`${this.uri}/notifications`, object);
  }

}
