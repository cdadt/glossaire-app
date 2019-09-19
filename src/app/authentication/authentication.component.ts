import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService, TokenPayload } from '../../services/authentication.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {

  authForm: FormGroup;
  errorMessage: string;
  credentials: TokenPayload = {
    username: '',
    password: ''
  };
  loader: boolean;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loader = false;
  }

  /**
   * Initialisation du formulaire de connexion avec la méthode réactive
   */
  initForm(): void {
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
  async onSubmitForm(): Promise<any> {
    this.loader = true;
    const username = this.authForm.get('username').value;
    const password = this.authForm.get('password').value;
    this.credentials.username = username;
    this.credentials.password = password;

    const isAuth = await this.authService.login(this.credentials);
    if (isAuth) {
      this.router.navigateByUrl('/dashboard');
    } else {
      this.errorMessage = 'L\'identifiant ou le mot est incorrect';
      this.loader = false;
    }
  }
}
