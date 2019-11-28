import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { NotificationService } from './notification.service';
import {environment} from "../environments/environment";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UtilitaryService {

  constructor(private http: HttpClient,
              private authService: AuthenticationService,
              private notificationService: NotificationService) { }

  /**
   * Méthode qui permet de créer un élement HTML.
   * @param element - L'élément à créer
   * @param id - L'id de l'élément
   * @param cssClasses - Tableau des classes css pour l'élément (facultatif)
   * @param text - Le texte à mettre dans l'élément (facultatif)
   */
  createHtmlElement(element: string, id: string, cssClasses?: Array<string>, text?: string): any {
    const elt = document.createElement(element);
    elt.id = id;
    if (cssClasses && cssClasses.length > 0) {
      for (const cssClass of cssClasses) {
        elt.classList.add(cssClass);
      }
    }
    if (text) {
      const txt = document.createTextNode(text);
      elt.appendChild(txt);
    }

    return elt;
  }

  /**
   * Méthode qui permet de faire un toggle d'attribut sur 2 éléments.
   * @param elt1 - Le premier élément
   * @param elt2 - Le deuxième élément
   * @param attributeToggle - L'attribute à mettre/enlever
   */
  toggleAttributeOnElements(elts: Array<any>, attributeToggle: string): void {
    for (const elt of elts) {
      elt.toggleAttribute(attributeToggle);
    }
  }

  /**
   * Lance la requête au serveur.
   * @param query: la requête à envoyer.
   */
  async sendQuery(query: any): Promise<any> {
    switch (query.params.queryType) {
      case 'post': {
        return this.sendPostQuery(query);
        break;
      }
      case 'delete': {
        return this.sendDeleteQuery(query);
        break;
      }
      case 'patch': {
        return this.sendPatchQuery(query);
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * Méthode permettant d'envoyer une requête de type post.
   * @param query - La requête à envoyer.
   */
  private async sendPostQuery(query): Promise<any> {
    return this.http.post(query.url, query.params, query.option)
        .pipe(
          tap(val => {
            if (query.params.wordInfo) {
              this.notificationService.send(query.params.wordInfo.title, this.authService.getUserDetails().username)
                  .subscribe();
            }
          })
    )
        .toPromise();
  }

  /**
   * Méthode permettant d'envoyer une requête de type delete.
   * @param query - La requête à envoyer.
   */
  private async sendDeleteQuery(query): Promise<any> {
    return this.http.delete(query.url, {
      headers: query.option.headers,
      params : query.params
    })
        .toPromise();
  }

  private async sendPatchQuery(query): Promise<any> {
    return this.http.patch(query.url, {
      headers: query.option.headers,
      params : query.params
    })
        .toPromise();
  }
}
