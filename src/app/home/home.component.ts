import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SwPush } from '@angular/service-worker';
import { TimeagoIntl } from 'ngx-timeago';
import { strings as FrenchStrings } from 'ngx-timeago/language-strings/fr';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../../services/authentication.service';
import { NotificationService } from '../../services/notification.service';
import { SearchService } from '../../services/search.service';
import { ThemeService } from '../../services/theme.service';
import { WordService } from '../../services/word.service';
import Word from '../models/word.model';

@Component({
  selector: 'app-home',
  animations: [
    trigger('openClose', [
      state('open', style({
        top: '0'
      })),
      state('closed', style({
        top: '-100%'
      })),
      transition('open => closed', [
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ])
    ])
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  word: Word;
  searchResults: any = { words: [], themes: [] };
  displayResults: boolean;
  isOpenSuccess: boolean;
  isOpenError: boolean;
  live: true;
  queryField: FormControl = new FormControl ();
  imageUrl: any;

  constructor(
              private wordService: WordService,
              private themeService: ThemeService,
              private authService: AuthenticationService,
              private swPush: SwPush,
              private notificationService: NotificationService,
              private searchService: SearchService,
              intl: TimeagoIntl
  ) {
    // L'overlay et le résultat de la recherche ne sont pas affichés par défaut
    this.displayResults = false;

    // Les messages d'erreur sont masqués par défaut
    this.isOpenSuccess = false;
    this.isOpenError = false;

    // Les fichiers de langue pour le module Ilya(Timeago)
    intl.strings = FrenchStrings;
    intl.changes.next();
  }

  /**
   * Fonction appelée à l'initialisation du composant
   * Récupère la dernière définition ajoutée
   */
  async ngOnInit(): Promise<any> {
    this.word = (await this.wordService.getLastWord()) as Word;
    this.imageUrl = undefined;
    if (this.word.img) {
      this.imageUrl = `data:${this.word.img.contentType};base64,${this.word.img.data}`;
    }

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
        this.displayResults = true;

        // ****** Positionne les résultats de la recherche en fonction de l'input ****** //
        // On récupère le champ de recherche
        const inputSearch = (document.getElementById('home-search') as HTMLInputElement);

        // On position les résultats en fonction de l'input
        const inputOffsetLeft = inputSearch.offsetLeft;
        const heightInputSearch = inputSearch.offsetHeight;
        const inputOffsetTop = heightInputSearch + inputSearch.offsetTop + 5;

        const divResults = (document.getElementById('home-search-results') as HTMLInputElement);
        divResults.style.top = `${inputOffsetTop}px`;
        divResults.style.left = `${inputOffsetLeft}px`;
        // ****** Positionne les résultats de la recherche en fonction de l'input ****** //

        this.searchResults = result;
        this.displayResults = this.queryField.value !== null && this.queryField.value !== '';
      });

    // On vérifie la compatibilité du navigateur aux notifications
    await this.notificationService.isBrowserCompatibleToNotif();
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
    if (this.queryField.value !== null && this.queryField.value !== '') {
      await this.searchService.search(this.queryField.value)
          .then(success => {
            this.searchResults = success;
            this.displayResults = true;
          });
    }
  }

  /**
   * Méthode permettant de savoir si l'utilisateur est connecté ou non
   */
  isLoggedIn(): any {
    return this.authService.isLoggedIn();
  }

  /**
   * Méthode permettant de fermer la fenêtre d'information "Abonnement effectué" ou "Abonnement rejeté"
   */
  onClose(): void {
    this.isOpenSuccess = false;
    this.isOpenError = false;
  }

  // ********************************************************************** NOTIFICATIONS

  /**
   * Méthode appelée lorsque l'utilisateur clique sur le bouton "S'abonner aux notification"
   * Demande au service web push d'inscrire la personne aux notification en générant une subscription "sub"
   */
  subscribeToNotifications(): void {
    this.notificationService.subscribeToNotifications();
    if (this.notificationService.getErrorWhenSubscribe()) {
      this.isOpenError = true;
    } else {
      this.isOpenSuccess = true;
    }
  }

  /**
   * Méthode permettant de désinscrire le naviagteur aux notification. Puis on utilise la fonction unsubscriptionSuccessful
   * pour supprimer l'entrée concernant l'abonnement dans la Base de Données
   */
  async unsubscribeToNotifications(): Promise<any> {
    this.notificationService.unsubscribeToNotifications();
  }
  getIsSubscriber(): string {
    return this.notificationService.getIsSubscriber();
  }

  getNotification(): boolean {
    return this.notificationService.getNotification();
  }
}
