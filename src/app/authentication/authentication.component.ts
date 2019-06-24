import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, TokenPayload} from '../../services/authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {

  public authForm: FormGroup;
  errorMessage: string;
  credentials: TokenPayload = {
    username: '',
    password: ''
  };

  constructor(private formBuilder: FormBuilder,
              private authService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit() {
    this.initForm();
  }

  /**
   * Initialisation du formulaire de connexion avec la méthode réactive
   */
  initForm() {
    this.authForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)]]
    });
  }

  /**
   * A la soumission du formulaire on récupère les données et on authentifie l'utilisateur
   * Une fois l'utilisateur authentifié on le redirige vers la page dashboard
   * Sinon on affiche l'erreur
   */
  onSubmitForm() {
    const username = this.authForm.get('username').value;
    const password = this.authForm.get('password').value;
    this.credentials.username = username;
    this.credentials.password = password;

    this.authService.login(this.credentials).subscribe(() => {
      this.router.navigateByUrl('/dashboard');
    }, (err) => {
      console.error(err);
      this.errorMessage = 'L\'identifiant ou le mot est incorrect';
    });
  }
}
