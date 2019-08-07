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
    this.themesSubscription = this.themeService.themesSubject.subscribe(
      (themes: Array<Theme>) => {
          this.themes = themes;
      }
    );
    this.themeService.emitThemes();
  }

  onDeleteTheme(themeId): void {
    this.themeService.deleteOneTheme(themeId);
  }

}
