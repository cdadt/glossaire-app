import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeagoIntl } from 'ngx-timeago';
import { strings as FrenchStrings } from 'ngx-timeago/language-strings/fr';
import { Subject } from 'rxjs';
import { WordService } from '../../../services/word.service';
import Word from '../../models/word.model';

@Component({
  selector: 'app-edit-word',
  templateUrl: './edit-word.component.html',
  styleUrls: ['./edit-word.component.css']
})
export class EditWordComponent implements OnInit {

  word: Word;
  wordSubject = new Subject<Word>();
  open: boolean;
  live: true;
  imageUrl: string;
  displayDeleteWindow: boolean;

  constructor(private wordService: WordService,
              private route: ActivatedRoute,
              intl: TimeagoIntl,
              private router: Router) {
    // Les fichiers de langue pour le module Ilya(Timeago)
    intl.strings = FrenchStrings;
    intl.changes.next();
  }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.word = await this.wordService.getWordById(params.id) as Word;
      this.emitWord();
      this.imageUrl = undefined;
      if (this.word.img) {
        this.imageUrl = `data:${this.word.img.contentType};base64,${this.word.img.data}`;
      }

      this.open = false;
      this.displayDeleteWindow = false;
    });
  }

    /**
     * Méthode permettant de publier ou dépublier un mot lors d'un clic sur le bouton correspondant
     */
  async onTogglePublishWord(): Promise<void> {
      if (this.word.published) {
          const updatePublishState = await this.wordService.publishedOneWord(this.word._id, false);

          if (updatePublishState) {
              this.word.published = false;
              this.emitWord();
          }
      } else {
          const updatePublishState = await this.wordService.publishedOneWord(this.word._id, true);
          const updateValidateState = await this.wordService.validateOneWord(this.word._id, true);

          if (updatePublishState && updateValidateState) {
              this.word.validated = true;
              this.word.published = true;
              this.emitWord();
          }
      }
  }

    /**
     * Méthode permettant de valider ou invalider un mot lors d'un clic sur le bouton correspondant
     */
  async onToggleValidateWord(): Promise<void> {
      if (this.word.validated) {
          const updateValidateState = await this.wordService.validateOneWord(this.word._id, false);
          const updatePublishState = await this.wordService.publishedOneWord(this.word._id, false);

          if (updatePublishState && updateValidateState) {
              this.word.validated = false;
              this.word.published = false;
              this.emitWord();
          }
      } else {
          const updateValidateState = await this.wordService.validateOneWord(this.word._id, true);

          if (updateValidateState) {
              this.word.validated = true;
              this.emitWord();
          }
      }
  }

  /**
   * Permet de mettre à jour l'abonnement au mot
   */
  emitWord(): void {
      this.wordSubject.next(this.word);
   }

  onDeleteWord(): void {
      this.wordService.deleteOneWord(this.word._id);
      this.router.navigate(['mot/gerer']);
  }

  onCancelDelete(): void {
      this.displayDeleteWindow = false;
  }

  onDisplayDeleteWindow(): void {
      this.displayDeleteWindow = true;
  }
  /**
   * Indique si la partie "En savoir plus" est ouverte ou non
   */
  onDisplayKnowMore(): void {
    this.open = !this.open;
  }

}
