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
  searchWordForm;
  queryField: FormControl = new FormControl ();
  displayResults: boolean;

  constructor(private wordService: WordService,
              private formBuilder: FormBuilder,
              private searchService: SearchService) {
    this.displayResults = false;
  }

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

          // ****** Positionne les résultats de la recherche en fonction de l'input ****** //
          // On récupère le champ de recherche
          const inputSearch = (document.getElementById('manage-word-search') as HTMLInputElement);

          // On position les résultats en fonction de l'input
          const inputOffsetLeft = inputSearch.offsetLeft;
          const heightInputSearch = inputSearch.offsetHeight;
          const inputOffsetTop = heightInputSearch + inputSearch.offsetTop + 5;

          const divResults = (document.getElementById('manage-word-search-results') as HTMLInputElement);
          divResults.style.top = `${inputOffsetTop}px`;
          divResults.style.left = `${inputOffsetLeft}px`;
          // ****** Positionne les résultats de la recherche en fonction de l'input ****** /

          this.displayResults = this.queryField.value !== null && this.queryField.value !== '';
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

  /**
   * Méthode permettant d'avertir s'il faut afficher ou non l'overlay  et le résultat de la recherche
   */
  onDisplayResultsNone(): void {
    this.displayResults = false;
  }

  /**
   * Méthode qui permet d'afficher le résulats de la recherche au clic sur la barre de recherche si celle-ci n'est pas vide
   */
  async onDisplayResult(): Promise<void> {
      console.log(this.queryField.value);
    if (this.queryField.value !== null && this.queryField.value !== '') {
        this.displayResults = true;
        // await this.searchService.search(this.queryField.value)
        //     .then(success => {
        //         this.words = success;
        //         this.displayResults = true;
        //     });
    }
  }

  onResetSearch(): void {
      this.searchWordForm.get('word')
          .reset();
      this.queryField.patchValue('');
      this.onDisplayResultsNone();
  }
}
