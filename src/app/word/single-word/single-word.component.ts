import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeagoIntl } from 'ngx-timeago';
import { strings as FrenchStrings } from 'ngx-timeago/language-strings/fr';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../../services/authentication.service';
import { BookmarkService } from '../../../services/bookmark.service';
import { SyncService } from '../../../services/sync.service';
import { UserService } from '../../../services/user.service';
import { WordService } from '../../../services/word.service';
import User from '../../models/user.model';
import Word from '../../models/word.model';

@Component({
  selector: 'app-single-word',
  templateUrl: './single-word.component.html',
  styleUrls: ['./single-word.component.css']
})
export class SingleWordComponent implements OnInit {

  word: Word;
  open: boolean;
  live: true;
  publishedOk: boolean;
  imageUrl: string;
  user: User;
  bookmark = false;
  loader: boolean;

  constructor(private wordService: WordService,
              private route: ActivatedRoute,
              intl: TimeagoIntl,
              private bookmarkService: BookmarkService,
              private authService: AuthenticationService,
              private userService: UserService,
              private toastr: ToastrService,
              private router: Router,
              private syncService: SyncService) {
    // Les fichiers de langue pour le module Ilya(Timeago)
    intl.strings = FrenchStrings;
    intl.changes.next();
    this.publishedOk = false;
  }

  ngOnInit(): void {
    if (this.syncService.getIsOnline()) {
      this.loader = true;
    }
    this.route.params.subscribe(async params => {
        this.word = await this.wordService.getWordById(params.id) as Word;
        this.imageUrl = undefined;
        if (this.word.img) {
            this.imageUrl = `${this.word.img.data}`;
        }

        if (this.authService.isLoggedIn()) {
            this.user = (await this.userService.getUserLikeByUsername(this.authService.getUserDetails().username))[0] as User;
            this.isBookmark();
        }
        this.testPublicationState();
        this.open = false;
        this.loader = false;
    });
  }

  /**
   * Méthode permettant de vérifier que le mot est bien publié
   */
  testPublicationState(): void {
    if (this.word) {
      let countPublishedTheme = 0;
      this.word.themes.forEach(elem => {
        if (elem.published) {
          countPublishedTheme ++;
        }
      });
      if (countPublishedTheme > 0 && this.word.published && this.word.validated) {
        this.publishedOk = true;
      }
    }
  }

  /**
   * Indique si la partie "En savoir plus" est ouverte ou non
   */
  onDisplayKnowMore(): void {
    this.open = !this.open;
  }

  /**
   * Méthode permettant d'ajouter le mot dans les favoris
   */
  onAddBookmark(): void {
    const bookmark = {
      _id: this.word._id,
      title: this.word.title,
      definition: this.word.definition,
      published: this.word.published,
      validated: this.word.validated
    };
    this.bookmarkService.addBookmark(this.user._id, bookmark)
        .then(success => {
          this.toastr.success('Le mot a été ajouté à vos favoris');
          this.bookmark = true;
        })
        .catch(err => {
          this.bookmarkService.errorActions(err);
        });
  }

  /**
   * Méthode permettant de supprimer le mot des favoris
   */
  onDeleteBookmark(): void {
    this.bookmarkService.deleteBookmark(this.user._id, this.word._id)
        .then(success => {
          this.toastr.success('Le mot a été supprimé de vos favoris');
          this.bookmark = false;
        })
        .catch(err => {
          this.bookmarkService.errorActions(err);
        });
  }

  /**
   * méthode permettant de vérifier si le mot fait partie des favoris de l'utilisateur actuellement connecté
   */
  isBookmark(): any {
    this.bookmarkService.verifyBookmarkPresence(this.user._id, this.word._id)
        .then(success => {
          this.bookmark = success;
        });
  }

  /**
   * Méthode permettant de savoir si l'utilisateur est connecté ou non
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
