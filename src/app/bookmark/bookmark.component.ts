import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { BookmarkService } from '../../services/bookmark.service';
import { UserService } from '../../services/user.service';
import User from '../models/user.model';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.css']
})
export class BookmarkComponent implements OnInit {

  user: User;
  userSubject = new Subject<User>();
  userSubscription: Subscription;

  constructor(private userService: UserService,
              private authService: AuthenticationService,
              private bookmarkService: BookmarkService,
              private toastr: ToastrService) { }

  async ngOnInit(): Promise<any> {
    this.user = (await this.userService.getUserLikeByUsername(this.authService.getUserDetails().username))[0] as User;
    this.emitUser();

    this.userSubscription = this.userSubject.subscribe(
        (user: User) => {
          this.user = user;
        }
    );
  }

  /**
   * Méthode permettant de mettre à jour l'abonnement à l'utilisateur
   */
  emitUser(): void {
    this.userSubject.next(this.user);
  }

  /**
   * Méthode permettant de supprimer un favoris
   * @param word Le mot à supprimer
   */
  onDeleteWordBookmark(word): void {
  this.bookmarkService.deleteBookmark(this.user._id, word._id)
      .then(success => {
    this.user.bookmark.splice(this.user.bookmark.indexOf(word), 1);
    this.emitUser();
  })
      .catch(err => {
    this.bookmarkService.errorActions(err);
  });
  }

  /**
   * Affiche le contenu de la défintion.
   * @param _id L'id du mot dont le contenu doit être affiché
   */
  showContent(_id): void {
    const angleRight = document.getElementById(`ar-${_id}`);
    const angleDown = document.getElementById(`ad-${_id}`);
    const content = document.getElementById(`c-${_id}`);

    angleRight.toggleAttribute('hidden');
    angleDown.toggleAttribute('hidden');
    content.toggleAttribute('hidden');
  }

}
