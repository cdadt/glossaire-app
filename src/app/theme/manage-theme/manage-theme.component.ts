import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SearchService } from '../../../services/search.service';
import { ThemeService } from '../../../services/theme.service';
import Theme from '../../models/theme.model';

@Component({
  selector: 'app-manage-theme',
  templateUrl: './manage-theme.component.html',
  styleUrls: ['./manage-theme.component.css']
})
export class ManageThemeComponent implements OnInit {

  themes: Array<Theme>;
  themesSubscription: Subscription;
  searchThemeForm;
  queryField: FormControl = new FormControl ();

  constructor(private themeService: ThemeService,
              private formBuilder: FormBuilder,
              private searchService: SearchService) { }

  async ngOnInit(): Promise<void> {
    this.initSearchForm();

    // Permet de mettre à jour automatiquement la page si un thème est supprimé
    this.themesSubscription = this.themeService.themesSubject.subscribe(
      (themes: Array<Theme>) => {
          this.themes = themes;
      }
    );
    this.themeService.emitThemes();

    /**
     * Détecte les changements dans le formulaire de recherche et effectue la recherche sur les mots et les thèmes
     */
    this.queryField.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.searchOnChangedValue(query))
    )
        .subscribe (result => {
            this.themeService.themes = result;
            this.themeService.emitThemes();
        });
  }

  searchOnChangedValue(query): Promise<Array<Theme>> {
      if (query === null) {
          const themes = this.themeService.getThemes();

          return themes as Promise<Array<Theme>>;
      }

      return this.searchService.searchThemes(query);
  }

  /**
   * Méthode permettant d'initaliser le forulaire de recherche de thème
   */
  initSearchForm(): void {
    this.searchThemeForm = this.formBuilder.group({
      theme: ['', [Validators.maxLength(40)]]
    });
  }
    /**
     * Méthode permettant de supprimer un thème
     * @param themeId L'id du thème à supprimer
     */
  onDeleteTheme(themeId): void {
    this.themeService.deleteOneTheme(themeId);
  }

  /**
   * Méthode permettant de publier ou dépublier un thème
   * @param themeId L'id du thème à modifier
   * @param themePub L'état de publication souhaité
   */
  onPublishedTheme(themeId, themePub): void {
      this.themeService.publishedOneTheme(themeId, themePub);
  }

    /**
     * Méthode permettant de réinitialiser le formulaire de recherche
     */
  onCancel(): void {
      this.queryField.reset();
  }
}
