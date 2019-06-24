import {Component, OnInit} from '@angular/core';
import {WordService} from '../../../services/word.service';
import Word from '../../models/word.model';
import {ActivatedRoute} from '@angular/router';
import { TimeagoIntl } from 'ngx-timeago';
import {strings as FrenchStrings} from 'ngx-timeago/language-strings/fr';

@Component({
  selector: 'app-single-word',
  templateUrl: './single-word.component.html',
  styleUrls: ['./single-word.component.css']
})
export class SingleWordComponent implements OnInit {

  constructor(private wordService: WordService,
              private route: ActivatedRoute,
              intl: TimeagoIntl) {
    // Les fichiers de langue pour le module Ilya(Timeago)
    intl.strings = FrenchStrings;
    intl.changes.next();
  }

  word: Word;
  open: boolean;
  live: true;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.wordService.getWordByTitle(params.title).subscribe((data: Word[]) => {
        this.word = data[0];
        this.open = false;
      });
    });
  }

  /**
   * Indique si la partie "En savoir plus" est ouverte ou non
   */
  onDisplayKnowMore() {
    if (this.open === true) {
      this.open = false;
    } else {
      this.open = true;
    }
  }
}
