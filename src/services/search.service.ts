import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() { }


  /**
   * Méthode permettant de trier les résultats de la recherche : les résultats commençant par
   * la chaîne de charactères saisie apparaîtront en premier ceux contenant cette chaîne apparaîtront ensuite
   * @param tab Le tableau à trier
   * @param search Le contenu de a recherche
   */
  sortSearchTable(tab: any[], search) {
    const beginTab = [];
    const elseTab = [];

    tab.forEach(value => {
      if (value.title.substr(0, search.length).toLowerCase() === search.toLowerCase()) {
        beginTab.push(value);
      } else {
        elseTab.push(value);
      }
    });

    return beginTab.concat(elseTab);
  }

}
