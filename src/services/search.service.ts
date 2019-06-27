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
  async search(queryField): Promise<object> {
    const dataWord = await this.wordService.getWordsLikeByTitle(queryField) as Array<Word>;
    const dataWordsSorted = this.sortSearchTable(dataWord, queryField);

    const dataTheme = await this.themeService.getThemesLikeByTitle(queryField) as Array<Theme>;
    const dataThemesSorted = this.sortSearchTable(dataTheme, queryField);

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
  sortSearchTable(tab: Array<any> , search: string): Array<object> {
    const beginTab = [];
    const elseTab = [];

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
}
