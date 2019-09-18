import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitaryService {

  constructor() { }

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
}
