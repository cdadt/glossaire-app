import { Component, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { WordService } from '../../../services/word.service';
import Word from '../../models/word.model';

@Component({
  selector: 'app-validation-word',
  templateUrl: './validation-word.component.html',
  styleUrls: ['./validation-word.component.css']
})
export class ValidationWordComponent implements OnInit {

  words: Array<Word>;
  wordsSubject = new Subject<Array<Word>>();
  wordsSubscription: Subscription;

  constructor(private wordService: WordService) { }

  ngOnInit(): void {
    this.getWaitingWords();
    this.emitWords();

    this.wordsSubscription = this.wordsSubject.subscribe(
        (words: Array<Word>) => {
          this.words = words;
        }
    );
  }

  /**
   * Met à jour visuellement la liste des mots.
   */
  emitWords(): void {
    this.wordsSubject.next(this.words);
  }

  /**
   * Récupère la liste des mots en attente.
   */
  async getWaitingWords(): Promise<void> {
    this.words = await this.wordService.getWaitingWords() as Array<Word>;
  }

  /**
   * Affiche les boutons de gestion.
   * @param _id
   */
  showManageBtn(_id): void {
    const menuManageBtn = document.getElementById(`mmb-${_id}`);
    const manageBtn = document.getElementById(`mb-${_id}`);

    menuManageBtn.toggleAttribute('hidden');
    manageBtn.toggleAttribute('hidden');
  }

  /**
   * Affiche le contenu de la défintion.
   * @param _id
   */
  showContent(_id): void {
    const angleRight = document.getElementById(`ar-${_id}`);
    const angleDown = document.getElementById(`ad-${_id}`);
    const content = document.getElementById(`c-${_id}`);

    angleRight.toggleAttribute('hidden');
    angleDown.toggleAttribute('hidden');
    content.toggleAttribute('hidden');
  }

  /**
   * Méthode permettant de supprimer un mot.
   * @param word
   */
  onDeleteWord(word): void {
    this.wordService.deleteOneWord(word._id);
    this.words.splice(this.words.indexOf(word));
    this.emitWords();
  }

  /**
   * Méthode permettant de valider un mot.
   * @param word
   */
  onValidateWord(word): void {
   this.wordService.validateOneWord(word._id, true);
   this.words.splice(this.words.indexOf(word));
   this.emitWords();
  }

}
