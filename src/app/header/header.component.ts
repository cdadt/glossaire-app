import {Component, OnInit} from '@angular/core';
import {WordService} from '../../services/word.service';
import Word from '../models/word.model';
import Theme from '../models/theme.model';
import {ThemeService} from '../../services/theme.service';
import {AuthenticationService} from '../../services/authentication.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {SwPush} from '@angular/service-worker';
import {NewsletterService} from '../../services/newsletter.service';
import {TimeagoIntl} from 'ngx-timeago';
import {strings as FrenchStrings} from 'ngx-timeago/language-strings/fr';

@Component({
  selector: 'app-header',
  animations: [
    trigger('overlayDisplay', [
      state('open', style({
        opacity: '1',
      })),
      state('closed', style({
        opacity: '0',
      })),
      transition('open => closed', [
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
    trigger('menuDisplay', [
      state('open', style({
        left: '30vw',
      })),
      state('closed', style({
        left: '-100%',
      })),
      transition('open => closed', [
        animate('0.3s')
      ]),
      transition('closed => open', [
        animate('0.3s')
      ]),
    ]),
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  private searchValue: string;
  word: Word[];
  theme: Theme[];
  displayResults: boolean;
  isDisplayOverlayMenu: boolean;
  isMenuOpen: boolean;

  isSubscriber: string;
  private subscription;
  notification: boolean;

  readonly VAPID_PUBLIC_KEY = 'BNGmdT-zn-S0tocFwPP9Z6PG3pfouwebPHQ0lpAQg5Z5LLZJ4OdBXz8aN_ct19Bbvi56WeYosu94RCXS34D2NU0';

  constructor(private wordService: WordService,
              private themeService: ThemeService,
              private authService: AuthenticationService,
              private swPush: SwPush,
              private newsletterService: NewsletterService,) {
    // L'overlay et le résultat de la recherche ne sont pas affichés par défaut
    this.displayResults = false;
    this.isDisplayOverlayMenu = false;
    this.isMenuOpen = false;
  }

  async ngOnInit() {
    // Fixe une taille minimum au menu
    const winHeight = window.innerHeight;
    const elem = document.getElementById('header-menu-burger');
    const header = document.getElementById('header-menu').offsetHeight;

    elem.style.height = `${winHeight - header}px`;


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
    this.word = null;
    this.theme = null;

    // On récupère la valeur de la recherche
    this.searchValue = (document.getElementById('header-menu-search') as HTMLInputElement).value;

    // On fait appel au service pour récupérer les mots correspondants à la recherche
    this.wordService.getWordsLikeByTitle(this.searchValue).subscribe((data: Word[]) => {
      this.word = data;
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
   * Méthode permettant d'afficher les résultats de la recherche si une recherche est effectuée
   * si le résultat n'est pas vide
   */
  onDisplayResult() {
    this.searchValue = (document.getElementById('header-menu-search') as HTMLInputElement).value;
    if (this.searchValue !== null && this.searchValue !== '') {
      this.displayResults = true;
    }
  }

  /**
   * Méthode permettant d'ouvrir le menu burger ou le fermer
   */
  onDisplayMenu() {
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
  onDisplayMenuNone() {
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
  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  // ********************************************************************** NOTIFICATIONS
  /**
   * Méthode qui teste si l'abonnement existe ou non. En fonction du résultat, sera affiché un bouton "S'abonner" ou "Se désabonner"
   * @param pushSubscription Objet subscription
   */
  isSubscribe(pushSubscription) {
    if (pushSubscription === null) {
      this.isSubscriber = 'false';
    } else {
      this.subscription = pushSubscription.endpoint;
      this.isSubscriber = 'true';
    }
  }

  /**
   * Méthode appelée lorsque l'utilisateur clique sur le bouton "S'abonner aux notifications"
   * Demande au service web push d'inscrire la personne aux notification en générant une subscription "sub"
   */
  subscribeToNotifications() {
    this.isSubscriber = 'loading';
    // On inscrit la personne
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    }).then(
      sub => this.subscriptionSuccessful(sub)
      , err => console.log(err)
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
  }

  /**
   * Méthode permettant d'afficher le message de succès lors d'une tentative d'abonnement qui aurait réussi
   * Puis envoie la subscription pour enregistrement dans la Base de données
   * @param sub L'objet subscription
   */
  subscriptionSuccessful(sub) {

    // On indique à la page que la personne s'est abonnée et on lui renseigne le endpoint si jamais la personne souhaite
    // se désabonner. Puis on l'inscrit dans la Base de Données
    this.isSubscriber = 'true';
    this.subscription = sub.endpoint;
    this.newsletterService.addPushSubscriber(sub).subscribe();
  }

  /**
   * Méthode permettant de supprimer l'entrée d'une personne abonnée dans la Base de Données
   */
  unsubscriptionSuccessful() {
    this.isSubscriber = 'false';
    this.newsletterService.deletePushSubscriber(this.subscription).subscribe();
  }
}
