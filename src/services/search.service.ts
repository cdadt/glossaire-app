import { Injectable } from '@angular/core';
import Theme from '../app/models/theme.model';
import Word from '../app/models/word.model';
import { ThemeService } from './theme.service';
import { WordService } from './word.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private wordService: WordService,
              private themeService: ThemeService) { }

  /**
   * Méthode permettant de faire une recherche sur les mots et les thèmes
   * @param queryField La recherche effectuée
   */
  async search(queryField): Promise<any> {
    const dataWord = await this.wordService.getWordsLikeByTitle(queryField, 'true') as Array<Word>;
    const dataWordsSorted = this.sortSearchTable(dataWord, queryField)
        .slice(0, 4);

    const dataTheme = await this.themeService.getThemesLikeByTitle(queryField, 'true') as Array<Theme>;
    const dataThemesSorted = this.sortSearchTable(dataTheme, queryField)
        .slice(0, 2);

    return {
      words: dataWordsSorted as Array<Word>,
      themes: dataThemesSorted as Array<Theme>
    };
  }

  /**
   * Méthode permettant de trier les résultats de la recherche : les résultats commençant par
   * la chaîne de charactères saisie apparaîtront en premier ceux contenant cette chaîne apparaîtront ensuite
   * @param tab Le tableau à trier
   * @param search Le contenu de a recherche
   */
  sortSearchTable(tab: Array<any> , search: string): Array<any> {
    const beginTab = Array();
    const elseTab = Array();

    tab.forEach(value => {
      if (value.title.substr(0, search.length)
        .toLowerCase() === search.toLowerCase()) {
        beginTab.push(value);
      } else {
        elseTab.push(value);
      }
    });

    return beginTab.concat(elseTab);
  }

  /**
   * Méthode permettant de faire une recherche uniquement sur les thèmes
   * @param queryField La recherche effectuée
   */
  async searchThemes(queryField): Promise<Array<Theme>> {
    const dataTheme = await this.themeService.getThemesLikeByTitle(queryField) as Array<Theme>;

    return this.sortSearchTable(dataTheme, queryField);
  }

  /**
   * Méthode permettant de faire une recherche sur les mots et les thèmes
   * @param queryField La recherche effectuée
   */
  async searchWords(queryField): Promise<Array<Word>> {
    const dataWord = await this.wordService.getWordsLikeByTitle(queryField) as Array<Word>;

    return this.sortSearchTable(dataWord, queryField);
  }
}
