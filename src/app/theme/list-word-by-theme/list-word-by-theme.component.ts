import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { WordService } from '../../../services/word.service';
import Theme from '../../models/theme.model';
import Word from '../../models/word.model';

@Component({
  selector: 'app-list-word-by-theme',
  templateUrl: './list-word-by-theme.component.html',
  styleUrls: ['./list-word-by-theme.component.css']
})
export class ListWordByThemeComponent implements OnInit {

  words: Array<Word>;
  theme: Theme;
  imageUrl: string;

  constructor(private wordService: WordService,
              private themeService: ThemeService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.words = (await this.wordService.getWordsForATheme(params.id)) as Array<Word>;
      this.theme = (await this.themeService.getThemeById(params.id)) as Theme;

      this.imageUrl = undefined;
      if (this.theme.img) {
        this.imageUrl = `data:${this.theme.img.contentType};base64,${this.theme.img.data}`;
      }
    });
  }

  /**
   * Effectue des actions d'affichage lorsque l'on clique sur une définition
   * @param id L'id de la définition
   */
  onOpenDef(id): void {

    // On récupère le contenu et l'icône "flèche"
    const elem = document.getElementById(id);
    const elemi = document.getElementById(`i-${id}`);

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
