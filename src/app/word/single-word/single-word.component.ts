import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TimeagoIntl } from 'ngx-timeago';
import { strings as FrenchStrings } from 'ngx-timeago/language-strings/fr';
import { WordService } from '../../../services/word.service';
import Word from '../../models/word.model';

@Component({
  selector: 'app-single-word',
  templateUrl: './single-word.component.html',
  styleUrls: ['./single-word.component.css']
})
export class SingleWordComponent implements OnInit {

  word: Word;
  open: boolean;
  live: true;
  publishedOk: boolean;
  imageUrl: string;

  constructor(private wordService: WordService,
              private route: ActivatedRoute,
              intl: TimeagoIntl) {
    // Les fichiers de langue pour le module Ilya(Timeago)
    intl.strings = FrenchStrings;
    intl.changes.next();
    this.publishedOk = false;
  }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.word = await this.wordService.getWordById(params.id) as Word;
      this.imageUrl = undefined;
      if (this.word.img) {
        this.imageUrl = `data:${this.word.img.contentType};base64,${this.word.img.data}`;
      }

      this.testPublicationState();
      this.open = false;
    });
  }

  /**
   * Méthode permettant de vérifier que le mot est bien publié
   */
  testPublicationState(): void {
    if (this.word) {
      let countPublishedTheme = 0;
      this.word.themes.forEach(elem => {
        if (elem.published === 'true') {
          countPublishedTheme ++;
        }
      });
      if (countPublishedTheme > 0) {
        this.publishedOk = true;
      }
    }
  }

  /**
   * Indique si la partie "En savoir plus" est ouverte ou non
   */
  onDisplayKnowMore(): void {
    this.open = !this.open;
  }
}
