import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
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

  constructor(private themeService: ThemeService) { }

  async ngOnInit(): Promise<void> {
    // Permet de mettre à jour automatiquement la page si un thème est supprimé
    this.themesSubscription = this.themeService.themesSubject.subscribe(
      (themes: Array<Theme>) => {
          this.themes = themes;
      }
    );
    this.themeService.emitThemes();
  }

    /**
     * Méthode permettant de supprimer un thème
     * @param themeId L'id du thème à supprimer
     */
  onDeleteTheme(themeId): void {
    this.themeService.deleteOneTheme(themeId);
  }

  onPublishedTheme(themeId, themePub): void {
      this.themeService.publishedOneTheme(themeId, themePub);
  }
}
