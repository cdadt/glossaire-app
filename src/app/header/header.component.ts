import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SwPush } from '@angular/service-worker';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../../services/authentication.service';
import { NotificationService } from '../../services/notification.service';
import { SearchService } from '../../services/search.service';
import { ThemeService } from '../../services/theme.service';
import { WordService } from '../../services/word.service';

@Component({
  selector: 'app-header',
  animations: [
    trigger('overlayDisplay', [
      state('open', style({
        opacity: '1'
      })),
      state('closed', style({
        opacity: '0'
      })),
      transition('open => closed', [
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ])
    ]),
    trigger('menuDisplay', [
      state('open', style({
        left: '30vw'
      })),
      state('closed', style({
        left: '-100%'
      })),
      transition('open => closed', [
        animate('0.3s')
      ]),
      transition('closed => open', [
        animate('0.3s')
      ])
    ])
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {

  searchResults: any = { words: [], themes: [] };
  displayResults: boolean;
  isDisplayOverlayMenu: boolean;
  isMenuOpen: boolean;
  queryField: FormControl = new FormControl ();
  displayNotificationMenu: boolean;

  constructor(private wordService: WordService,
              private themeService: ThemeService,
              private authService: AuthenticationService,
              private swPush: SwPush,
              private notificationService: NotificationService,
              private searchService: SearchService
              ) {
    // L'overlay et le résultat de la recherche ne sont pas affichés par défaut
    this.displayResults = false;
    this.isDisplayOverlayMenu = false;
    this.isMenuOpen = false;
    this.displayNotificationMenu = false;
  }

  async ngOnInit(): Promise<any> {
    // Fixe une taille minimum au menu
    const winHeight = window.innerHeight;
    const elem = document.getElementById('header-menu-burger');
    const header = document.getElementById('header-menu').offsetHeight;

    elem.style.height = `${winHeight - header}px`;

    /**
     * Détecte les changements dans le formulaire de recherche et effectue la recherche sur les mots et les thèmes
     */
    this.queryField.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.searchService.search(query))
        )
      .subscribe (result => {
        // On affiche l'overlay et le résultat
        this.displayResults = this.queryField.value !== null && this.queryField.value !== '';
        this.searchResults = result;
      });

    // On vérifie la compatibilité du navigateur aux notifications
    await this.notificationService.isBrowserCompatibleToNotif();
  }

  onDisplayNone(): void {
    this.displayResults = false;
  }

  /**
   * Méthode permettant d'afficher les résultats de la recherche si une recherche est effectuée
   * si le résultat n'est pas vide
   */
  async onDisplayResult(): Promise<void> {
    const searchValue = (document.getElementById('header-menu-search') as HTMLInputElement).value;
    if (searchValue !== null && searchValue !== '') {
            await this.searchService.search(searchValue)
                .then(success => {
                    this.searchResults = success;
                    this.displayResults = true;
        }
      );
    }
  }

  /**
   * Méthode permettant d'ouvrir le menu burger ou le fermer
   */
  onDisplayMenu(): void {
    const elem = document.getElementById('header-menu-burger');
    const overlay = document.getElementById('overlay-menu');

    if (elem.className === 'header-menu-burger open') {
      elem.className = 'header-menu-burger';

      overlay.style.display = 'none';
      this.isMenuOpen = false;
    } else {
      elem.className = 'header-menu-burger open';

      overlay.style.display = 'block';

      this.isDisplayOverlayMenu = true;
      this.isMenuOpen = true;
    }
  }

  /**
   * Méthode qui ferme le menu
   */
  onDisplayMenuNone(): void {
    const elem = document.getElementById('header-menu-burger');
    const overlay = document.getElementById('overlay-menu');

    if (elem.className === 'header-menu-burger open') {
      elem.className = 'header-menu-burger';

      overlay.style.display = 'none';

      this.isMenuOpen = false;
    }

  }

  /**
   * Méthode permettant de savoir si l'utilisateur est connecté ou non
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // ********************************************************************** NOTIFICATIONS

  /**
   * Méthode appelée lorsque l'utilisateur clique sur le bouton "S'abonner aux notification"
   * Demande au service web push d'inscrire la personne aux notification en générant une subscription "sub"
   */
  subscribeToNotifications(): void {
    this.notificationService.subscribeToNotifications();
  }

  /**
   * Méthode permettant de désinscrire le naviagteur aux notification. Puis on utilise la fonction unsubscriptionSuccessful
   * pour supprimer l'entrée concernant l'abonnement dans la Base de Données
   */
  unsubscribeToNotifications(): void {
    this.notificationService.unsubscribeToNotifications();
  }

  getIsSubscriber(): string {
    return this.notificationService.getIsSubscriber();
  }

  getNotification(): boolean {
    return this.notificationService.getNotification();
  }

    /**
     * Méthode permettant de fermer ou d'ouvrir le menu des notifications pour les écrans larges
     */
  onDisplayNotificationMenu(): void {
      this.displayNotificationMenu = !this.displayNotificationMenu;
  }
}
