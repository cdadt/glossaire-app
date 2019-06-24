import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';



@Injectable()
export class NewsletterService {

  uri = 'https://azaguilla.alwaysdata.net';
  // uri = 'http://localhost:4000';
  constructor(private http: HttpClient) {

  }

  /**
   * On enregistre le nouvel abonné dans la BDD
   * @param sub L'abonnement push au format json
   */
  addPushSubscriber(sub: any) {
    return this.http.post<any>(`${this.uri}/api/notifications`, sub);
  }

  /**
   * Méthode permettant de supprimer une subscription
   * @param endpoint Le endpoint de l'objet subscription
   */
  deletePushSubscriber(endpoint: any) {
    const sub = {
      endpoint
    };
    return this.http.post<any>(`${this.uri}/api/notifications/del`, sub);
  }

  /**
   * On envoie le message à tous les abonnés
   */
  send(title, user) {
    const object = {
      title,
      user
    };
    return this.http.post<any>(`${this.uri}/api/newsletter`, object);
  }

}
