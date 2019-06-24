import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import Theme from '../../models/theme.model';
import {ThemeService} from '../../../services/theme.service';
import {WordService} from '../../../services/word.service';
import {NewsletterService} from '../../../services/newsletter.service';
import {AuthenticationService} from '../../../services/authentication.service';

@Component({
  selector: 'app-add-word',
  templateUrl: './add-word.component.html',
  styleUrls: ['./add-word.component.css']
})
export class AddWordComponent implements OnInit {

  wordForm;
  message: string;
  themes: Theme[];

  constructor(private formBuilder: FormBuilder,
              private themeService: ThemeService,
              private wordService: WordService,
              private newsletterService: NewsletterService,
              private authService: AuthenticationService) {
    this.themeService.getThemes().subscribe((data: Theme[]) => {
      this.themes = data;
    });
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.wordForm = this.formBuilder.group({
      word: ['', [Validators.required, Validators.maxLength(40)]],
      definition: ['', [Validators.required]],
      knowMore: [''],
      theme: ['', [Validators.required]]
    });
  }

  onSubmitForm() {
    if (this.wordForm.valid) {
      const word = this.wordForm.get('word').value;
      const definition = this.wordForm.get('definition').value;
      const knowMore = this.wordForm.get('knowMore').value;
      const themes = this.wordForm.get('theme').value;

      // Pour chacun des themes choisis on recherche dans la liste initiale le titre correspondant à l'ID
      const themesObj = [];
      for (let i = 0; i < themes.length; i++) {
        themesObj.push(this.themes.find(function(element) {
          return element._id === themes[i];
        }));
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
      this.newsletterService.send(word, this.authService.getUserDetails().username).subscribe();
    } else {
      this.message = 'error';
    }
  }

  /**
   * Méthode permettant de fermer la fenêtre d'information "Définition créée"
   */
  onClose() {
    this.message = 'none';
  }

}
