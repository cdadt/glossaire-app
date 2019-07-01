import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SwPush } from '@angular/service-worker';
import { TimeagoIntl } from 'ngx-timeago';
import { strings as FrenchStrings } from 'ngx-timeago/language-strings/fr';
import 'rxjs-compat/add/operator/debounceTime';
import 'rxjs-compat/add/operator/distinctUntilChanged';
import { AuthenticationService } from '../../services/authentication.service';
import { NewsletterService } from '../../services/newsletter.service';
import { SearchService } from '../../services/search.service';
import { ThemeService } from '../../services/theme.service';
import { WordService } from '../../services/word.service';
import Theme from '../models/theme.model';
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
  searchResults: object = { words: [], themes: [] };
  displayResults: boolean;
  isSubscriber: boolean;
  isOpenSuccess: boolean;
  isOpenError: boolean;
  notification: boolean;

  readonly VAPID_PUBLIC_KEY = 'BNGmdT-zn-S0tocFwPP9Z6PG3pfouwebPHQ0lpAQg5Z5LLZJ4OdBXz8aN_ct19Bbvi56WeYosu94RCXS34D2NU0';
  live: true;

  queryField: FormControl = new FormControl ();
  private subscription: string;

  constructor(
              private wordService: WordService,
              private themeService: ThemeService,
              private authService: AuthenticationService,
              private swPush: SwPush,
              private newsletterService: NewsletterService,
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

    /**
     * Détecte les changements dans le formulaire de recherche et effectue la recherche sur les mots et les thèmes
     */
    this.queryField.valueChanges
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe (async queryField => {
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
        divResults.style.top = inputOffsetTop + 'px';
        divResults.style.left = inputOffsetLeft + 'px';
        // ****** Positionne les résultats de la recherche en fonction de l'input ****** //

        this.searchResults = await this.searchService.search(queryField);
        this.onDisplayResult();
      });

    // vérifie si le navigateur n'est pas Safari, si c'est le cas, vérifie que le navigateur supporte les
    // notification et enfin si le navigateur est inscrit aux notification
    if (window.navigator.userAgent.indexOf('Safari') > -1 && window.navigator.userAgent.indexOf('Chrome') === -1) {
      this.notification = false;
    } else {
      if (('Notification' in window)) {
        this.notification = true;
        await (await navigator.serviceWorker.getRegistration()).pushManager.getSubscription().then(
          pushSubscription => this.isSubscribe(pushSubscription)).catch(err => console.log(err));
      } else {
        this.notification = false;
      }
    }
  }

  /**
   * Méthode permettant d'avertir s'il faut afficher ou non l'overlay  et le résultat de la recherche
   */
  onDisplayNone(): void {
    this.displayResults = false;
  }

  /**
   * Méthode qui permet d'afficher le résulats de la recherche au clic sur la barre de recherche si celle-ci n'est pas vide
   */
  onDisplayResult(): void {
    if (this.queryField.value !== null && this.queryField.value !== '') {
      this.displayResults = true;
    } else {
      this.onDisplayNone();
    }
  }

  /**
   * Méthode permettant d'afficher le message d'erreur lors d'une tentative d'abonnement qui aurait échoué
   */
  displayError(err): void {
    console.log(err);
    this.isOpenError = true;
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

  /**
   * Méthode qui teste si l'abonnement existe ou non. En fonction du résultat, sera affiché un bouton "S'abonner" ou "Se désabonner"
   * @param pushSubscription Objet subscription
   */
  isSubscribe(pushSubscription): void {
    if (pushSubscription === null) {
      this.isSubscriber = false;
    } else {
      this.subscription = pushSubscription.endpoint;
      this.isSubscriber = true;
    }
  }

  /**
   * Méthode appelée lorsque l'utilisateur clique sur le bouton "S'abonner aux notification"
   * Demande au service web push d'inscrire la personne aux notification en générant une subscription "sub"
   */
  subscribeToNotifications(): void {

    // On inscrit la personne
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    }).then(
      sub => this.subscriptionSuccessful(sub)
    , err => this.displayError(err)
    );
  }

  /**
   * Méthode permettant de désinscrire le naviagteur aux notification. Puis on utilise la fonction unsubscriptionSuccessful
   * pour supprimer l'entrée concernant l'abonnement dans la Base de Données
   */
  async unsubscribeToNotifications(): Promise<any> {

    // On désinscrit la personne
    await (await navigator.serviceWorker.getRegistration()).pushManager.getSubscription().then(
      pushSubscription => pushSubscription.unsubscribe()).then(
      success => this.unsubscriptionSuccessful()
    );
  }

  /**
   * Méthode permettant d'afficher le message de succès lors d'une tentative d'abonnement qui aurait réussi
   * Puis envoie la subscription pour enregistrement dans la Base de données
   * @param sub L'objet subscription
   */
  subscriptionSuccessful(sub): void {

    // On affiche le message de réussite
    this.isOpenSuccess = true;

    // On indique à la page que la personne s'est abonnée et on lui renseigne le endpoint si jamais la personne souhaite
    // se désabonner. Puis on l'inscrit dans la Base de Données
    this.isSubscriber = true;
    this.subscription = sub.endpoint;
    this.newsletterService.addPushSubscriber(sub)
        .subscribe();
  }

  /**
   * Méthode permettant de supprimer l'entrée d'une personne abonnée dans la Base de Données
   */
  unsubscriptionSuccessful(): void {
    this.isSubscriber = false;
    this.newsletterService.deletePushSubscriber(this.subscription)
        .subscribe();
  }
}
