import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import { WordService } from '../../../services/word.service';
import Theme from '../../models/theme.model';

@Component({
  selector: 'app-add-word',
  templateUrl: './add-word.component.html',
  styleUrls: ['./add-word.component.css']
})
export class AddWordComponent implements OnInit {

  wordForm;
  message: string;
  themes: Array<Theme>;

  constructor(private formBuilder: FormBuilder,
              private themeService: ThemeService,
              private wordService: WordService) {
  }

  async ngOnInit(): Promise<any> {
    this.initForm();
    this.themes = await this.themeService.getThemes() as Array<Theme>;
  }

  initForm(): void {
    this.wordForm = this.formBuilder.group({
      word: ['', [Validators.required, Validators.maxLength(40)]],
      definition: ['', [Validators.required]],
      knowMore: [''],
      theme: ['', [Validators.required]]
    });
  }

  onSubmitForm(): void {
    if (this.wordForm.valid) {
      const word = this.wordForm.get('word').value;
      const definition = this.wordForm.get('definition').value;
      const knowMore = this.wordForm.get('knowMore').value;
      const themes = this.wordForm.get('theme').value;

      // Pour chacun des themes choisis on recherche dans la liste initiale le titre correspondant à l'ID
      const themesObj = [];
      for (const theme of themes) {
        themesObj.push(this.themes.find(element => element._id === theme));
      }

      // On contruit l'objet à envoyer en BDD
      const wordInfo = {
        title: word,
        definition,
        know_more: knowMore,
        themes: themesObj,
        last_edit : new Date().getTime()
      };

      this.message = 'saved';
      this.wordForm.reset();
      this.wordService.addWord(wordInfo);
    } else {
      this.message = 'error';
    }
  }

  /**
   * Méthode permettant de fermer la fenêtre d'information "Définition créée"
   */
  onClose(): void {
    this.message = 'none';
  }

}
