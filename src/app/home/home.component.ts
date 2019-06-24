import {Component, OnInit} from '@angular/core';
import Word from '../models/word.model';
import {WordService} from '../../services/word.service';
import Theme from '../models/theme.model';
import {ThemeService} from '../../services/theme.service';
import {AuthenticationService} from '../../services/authentication.service';
import {SwPush} from '@angular/service-worker';
import {NewsletterService} from '../../services/newsletter.service';
import {TimeagoIntl} from 'ngx-timeago';
import {strings as FrenchStrings} from 'ngx-timeago/language-strings/fr';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-home',
  animations: [
    trigger('openClose', [
      state('open', style({
        top: '0',
      })),
      state('closed', style({
        top: '-100%',
      })),
      transition('open => closed', [
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  word: Word;
  private searchValue: string;
  words: Word[];
  theme: Theme[];
  displayResults: boolean;
  isSubscriber: boolean;
  private subscription;
  isOpenSuccess: boolean;
  isOpenError: boolean;
  notification: boolean;

  readonly VAPID_PUBLIC_KEY = 'BNGmdT-zn-S0tocFwPP9Z6PG3pfouwebPHQ0lpAQg5Z5LLZJ4OdBXz8aN_ct19Bbvi56WeYosu94RCXS34D2NU0';
  live: true;

  constructor(private wordService: WordService,
              private themeService: ThemeService,
              private authService: AuthenticationService,
              private swPush: SwPush,
              private newsletterService: NewsletterService,
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
  async ngOnInit() {
    this.wordService.getLastWord().subscribe((data: Word[]) => {
      this.word = data[0];
    });

    // vérifie si le navigateur n'est pas Safari, si c'est le cas, vérifie que le navigateur supporte les
    // notifications et enfin si le navigateur est inscrit aux notifications
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
   * Méthode qui effectue une recherche sur les mots et les thèmes
   */
  onSearch() {
    // On affiche l'overlay et le résultat
    this.displayResults = true;

    // On initialise les résultats à null pour qu'il ne garde pas la dernière recherche en mémoire (reste affichée sinon)
    this.words = null;
    this.theme = null;

    // On récupère la valeur de la recherche
    const inputSearch = (document.getElementById('home-search') as HTMLInputElement);
    this.searchValue = inputSearch.value;

    // On position les résultats en fonction de l'input
    const inputOffsetLeft = inputSearch.offsetLeft;
    const heightInputSearch = inputSearch.offsetHeight;
    const inputOffsetTop = heightInputSearch + inputSearch.offsetTop + 5;

    const divResults = (document.getElementById('home-search-results') as HTMLInputElement);
    divResults.style.top = inputOffsetTop + 'px';
    divResults.style.left = inputOffsetLeft + 'px';

    // On fait appel au service pour récupérer les mots correspondants à la recherche
    this.wordService.getWordsLikeByTitle(this.searchValue).subscribe((data: Word[]) => {
      this.words = data;
    });

    // On fait appel au service pour récupérer les thèmes correspondants à la recherche
    this.themeService.getThemesLikeByTitle(this.searchValue).subscribe((data: Theme[]) => {
      this.theme = data;
    });
  }

  /**
   * Méthode permettant d'avertir s'il faut afficher ou non l'overlay  et le résultat de la recherche
   */
  onDisplayNone() {
    this.displayResults = false;
  }

  /**
   * Méthode qui permet d'afficher le résulats de la recherche au clic sur la barre de recherche si celle-ci n'est pas vide
   */
  onDisplayResult() {
    this.searchValue = (document.getElementById('home-search') as HTMLInputElement).value;
    if (this.searchValue !== null && this.searchValue !== '') {
      this.displayResults = true;
    }
  }

  /**
   * Méthode permettant d'afficher le message d'erreur lors d'une tentative d'abonnement qui aurait échoué
   */
  displayError(err) {
    console.log(err);
    this.isOpenError = true;
  }


  /**
   * Méthode permettant de savoir si l'utilisateur est connecté ou non
   */
  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  /**
   * Méthode permettant de fermer la fenêtre d'information "Abonnement effectué" ou "Abonnement rejeté"
   */
  onClose() {
    this.isOpenSuccess = false;
    this.isOpenError = false;
    // On affiche le message de réussite
  }

  /**
   * Méthode qui teste si l'abonnement existe ou non. En fonction du résultat, sera affiché un bouton "S'abonner" ou "Se désabonner"
   * @param pushSubscription Objet subscription
   */
  isSubscribe(pushSubscription) {
    if (pushSubscription === null) {
      this.isSubscriber = false;
    } else {
      this.subscription = pushSubscription.endpoint;
      this.isSubscriber = true;
    }
  }

  /**
   * Méthode appelée lorsque l'utilisateur clique sur le bouton "S'abonner aux notifications"
   * Demande au service web push d'inscrire la personne aux notification en générant une subscription "sub"
   */
  subscribeToNotifications() {

    // On inscrit la personne
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    }).then(
      sub => this.subscriptionSuccessful(sub)
    , err => this.displayError(err)
    );
  }

  /**
   * Méthode permettant de désinscrire le naviagteur aux notifications. Puis on utilise la fonction unsubscriptionSuccessful
   * pour supprimer l'entrée concernant l'abonnement dans la Base de Données
   */
  async unsubscribeToNotifications() {

    // On désinscrit la personne
    await (await navigator.serviceWorker.getRegistration()).pushManager.getSubscription().then(
      pushSubscription => pushSubscription.unsubscribe()).then(
      success => this.unsubscriptionSuccessful()
    );

    // this.swPush.unsubscribe()
    //   .then(success => this.unsubscriptionSuccessful(),
    //     err => console.log(err));
  }

  /**
   * Méthode permettant d'afficher le message de succès lors d'une tentative d'abonnement qui aurait réussi
   * Puis envoie la subscription pour enregistrement dans la Base de données
   * @param sub L'objet subscription
   */
  subscriptionSuccessful(sub) {

    // On affiche le message de réussite
    this.isOpenSuccess = true;

    // On indique à la page que la personne s'est abonnée et on lui renseigne le endpoint si jamais la personne souhaite
    // se désabonner. Puis on l'inscrit dans la Base de Données
    this.isSubscriber = true;
    this.subscription = sub.endpoint;
    this.newsletterService.addPushSubscriber(sub).subscribe();
  }

  /**
   * Méthode permettant de supprimer l'entrée d'une personne abonnée dans la Base de Données
   */
  unsubscriptionSuccessful() {
    this.isSubscriber = false;
    this.newsletterService.deletePushSubscriber(this.subscription).subscribe();
  }
}
