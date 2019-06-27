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

  constructor(private wordService: WordService,
              private route: ActivatedRoute,
              intl: TimeagoIntl) {
    // Les fichiers de langue pour le module Ilya(Timeago)
    intl.strings = FrenchStrings;
    intl.changes.next();
  }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.word = await this.wordService.getWordById(params.id) as Word;
      this.open = false;
    });
  }

  /**
   * Indique si la partie "En savoir plus" est ouverte ou non
   */
  onDisplayKnowMore(): void {
    this.open = !this.open;
  }
}
