import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, TokenPayload} from '../../services/authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public authForm: FormGroup;
  message: string;
  credentials: TokenPayload = {
    username: '',
    email: '',
    password: '',
    firstname: '',
    lastname: '',
  };

  constructor(private formBuilder: FormBuilder,
              private authService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit() {
    this.initForm();
  }

  /**
   * Initialisation du formulaire de connexion avec la méthide réactive
   */
  initForm() {
    this.authForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(60)]],
      password: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]/), Validators.minLength(8), Validators.maxLength(30)]],
      firstname: [''],
      lastname: [''],
    });
  }

  /**
   * A la soumission du formulaire on récupère les données et on authentifie l'utilisateur
   * Une fois l'utilisateur authentifié on le redirige vers la page dashboard
   * Sinon on affiche l'erreur
   */
  onSubmitForm() {
    if (this.authForm.valid) {
      const username = this.authForm.get('username').value;
      const email = this.authForm.get('email').value;
      const password = this.authForm.get('password').value;
      const firstname = this.authForm.get('firstname').value;
      const lastname = this.authForm.get('lastname').value;

      this.credentials.username = username;
      this.credentials.email = email;
      this.credentials.password = password;
      this.credentials.firstname = firstname;
      this.credentials.lastname = lastname;

      this.authService.register(this.credentials).subscribe(() => {
        this.message = 'registered';
        this.authForm.reset();
      }, (err) => {
        console.error(err);
      });
    } else {
      this.message = 'error';
    }
  }

  /**
   * Méthode permettant de fermer la fenêtre d'information "Utilisateur créé"
   */
  onClose() {
    this.message = 'none';
  }

  /**
   * Méthode permettant de réinitialiser le formulaire
   */
  onNew() {
    this.message = 'none';
    this.authForm.reset();
  }

}
