import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SearchService } from '../../../services/search.service';
import { WordService } from '../../../services/word.service';
import Word from '../../models/word.model';

@Component({
  selector: 'app-manage-word',
  templateUrl: './manage-word.component.html',
  styleUrls: ['./manage-word.component.css']
})
export class ManageWordComponent implements OnInit {

  words: Array<Word>;
  themesSubscription: Subscription;
  searchWordForm;
  queryField: FormControl = new FormControl ();

  constructor(private wordService: WordService,
              private formBuilder: FormBuilder,
              private searchService: SearchService) { }

  async ngOnInit(): Promise<void> {
    this.initSearchForm();

    /**
     * Détecte les changements dans le formulaire de recherche et effectue la recherche sur les mots et les thèmes
     */
    this.queryField.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.searchService.searchWords(query))
    )
        .subscribe (result => {
          this.words = result;
        });
  }

  /**
   * Méthode permettant d'initaliser le forulaire de recherche de thème
   */
  initSearchForm(): void {
    this.searchWordForm = this.formBuilder.group({
      word: ['', [Validators.maxLength(40)]]
    });
  }
}
