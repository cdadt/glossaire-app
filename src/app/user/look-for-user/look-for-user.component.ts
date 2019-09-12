import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SearchService } from '../../../services/search.service';
import { UserService } from '../../../services/user.service';
import User from '../../models/user.model';

@Component({
  selector: 'app-look-for-user',
  templateUrl: './look-for-user.component.html',
  styleUrls: ['./look-for-user.component.css']
})
export class LookForUserComponent implements OnInit {

  users: Array<User>;
  searchUserForm: any;
  queryField: FormControl = new FormControl ();
  displayResults: boolean;

  constructor(private userService: UserService,
              private formBuilder: FormBuilder,
              private searchService: SearchService) {
    this.displayResults = false;
  }

  ngOnInit(): void {
    this.initSearchForm();

    /**
     * Détecte les changements dans le formulaire de recherche et effectue la recherche sur les mots et les thèmes
     */
    this.queryField.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.searchService.searchUsers(query))
    )
        .subscribe (result => {
          this.users = result;

          // ****** Positionne les résultats de la recherche en fonction de l'input ****** //
          // On récupère le champ de recherche
          const inputSearch = (document.getElementById('user-search') as HTMLInputElement);

          // On position les résultats en fonction de l'input
          const inputOffsetLeft = inputSearch.offsetLeft;
          const heightInputSearch = inputSearch.offsetHeight;
          const inputOffsetTop = heightInputSearch + inputSearch.offsetTop + 5;

          const divResults = (document.getElementById('user-search-results') as HTMLInputElement);
          divResults.style.top = `${inputOffsetTop}px`;
          divResults.style.left = `${inputOffsetLeft}px`;
          // ****** Positionne les résultats de la recherche en fonction de l'input ****** /

          this.displayResults = this.queryField.value !== null && this.queryField.value !== '';
        });
  }

  /**
   * Méthode permettant d'initaliser le forulaire de recherche de thème
   */
  async initSearchForm(): Promise<void> {
    this.searchUserForm = this.formBuilder.group({
      user: ['', [Validators.maxLength(40)]]
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
  onDisplayResult(): void {
    if (this.queryField.value !== null && this.queryField.value !== '') {
      this.displayResults = true;
    }
  }

  onResetSearch(): void {
    this.searchUserForm.get('user')
        .reset();
    this.queryField.patchValue('');
    this.onDisplayResultsNone();
  }
}
