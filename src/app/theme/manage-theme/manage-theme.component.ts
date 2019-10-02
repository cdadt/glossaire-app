import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {Subject, Subscription} from 'rxjs';
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
  themesSubject = new Subject<Array<Theme>>();
  themesSubscription: Subscription;
  searchThemeForm;
  queryField: FormControl = new FormControl ();

  constructor(private themeService: ThemeService,
              private formBuilder: FormBuilder,
              private searchService: SearchService) { }

  async ngOnInit(): Promise<void> {
    this.initSearchForm();

    this.themes = await this.themeService.getThemesOnOpen() as Array<Theme>;
    this.emitThemes();
    // Permet de mettre à jour automatiquement la page si un thème est supprimé
    this.themesSubscription = this.themesSubject.subscribe(
      (themes: Array<Theme>) => {
          this.themes = themes;
      }
    );

    /**
     * Détecte les changements dans le formulaire de recherche et effectue la recherche sur les mots et les thèmes
     */
    this.queryField.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.searchOnChangedValue(query))
    )
        .subscribe (result => {
            this.themes = result;
            this.emitThemes();
        });
  }

  emitThemes(): void {
      this.themesSubject.next(this.themes);
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
  onDeleteTheme(theme): void {
    this.themeService.deleteOneTheme(theme._id);
    this.themes.splice(this.themes.indexOf(theme), 1);
    this.emitThemes();
  }

  /**
   * Méthode permettant de publier ou dépublier un thème
   * @param themeId L'id du thème à modifier
   * @param themePub L'état de publication souhaité
   */
  onPublishedTheme(theme, themePub): void {
      this.themeService.publishedOneTheme(theme._id, themePub);
      this.themes[this.themes.indexOf(theme)].published = themePub;
      this.emitThemes();
  }

    /**
     * Méthode permettant de réinitialiser le formulaire de recherche
     */
  onCancel(): void {
      this.queryField.reset();
  }
}
