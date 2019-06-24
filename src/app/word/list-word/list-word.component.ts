import {Component, OnInit} from '@angular/core';
import {WordService} from '../../../services/word.service';
import {ActivatedRoute} from '@angular/router';
import Word from '../../models/word.model';

@Component({
  selector: 'app-list-word',
  templateUrl: './list-word.component.html',
  styleUrls: ['./list-word.component.css']
})
export class ListWordComponent implements OnInit {

  words: Word[];
  thmTitle: string;

  constructor(private wordService: WordService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    // On récupère et on affiche les données à l'initialisation du composant
    this.route.params.subscribe(params => {
      this.thmTitle = params.title;
      this.wordService.getWordsByThmTitle(params.title).subscribe((data: Word[]) => {
        this.words = data;
      });
    });
  }

  /**
   * Effectue des actions d'affichage lorsque l'on clique sur une définition
   * @param id L'id de la définition
   */
  onOpenDef(id) {

    // On récupère le contenu et l'icône "flèche"
    const elem = document.getElementById(id);
    const elemi = document.getElementById('i-' + id);

    // Si le contenu est déjà affiché
    if (elem.className === 'list-word-def-content block') {
      // On lui dit de le fermer
      elem.className = 'list-word-def-content none';

      // La flèche reprend sa position initiale
      elemi.animate([
        // keyframes
        {transform: 'rotate(90deg)'},
        {transform: 'rotate(0)'}
      ], {
        // timing options
        duration: 250,
        fill: 'forwards'
      });
    } else {
      // Si le contenu est fermé
      // On lui dit de l'ouvrir
      elem.className = 'list-word-def-content block';

      // La flèche tourne à 90 degré
      elemi.animate([
        // keyframes
        {transform: 'rotate(0)'},
        {transform: 'rotate(90deg)'}
      ], {
        // timing options
        duration: 250,
        fill: 'forwards'
      });
    }
  }
}
