import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-forgotten-psw',
  templateUrl: './forgotten-psw.component.html',
  styleUrls: ['./forgotten-psw.component.css']
})
export class ForgottenPswComponent implements OnInit {
  forgottenPswForm: FormGroup;
  errorMessage: string;
  loader: boolean;
  emailSent: boolean;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loader = false;
    this.emailSent = false;
  }

  /**
   * Initialisation du formulaire de connexion avec la méthode réactive
   */
  initForm(): void {
    this.forgottenPswForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email, Validators.maxLength(60)]]
    });
  }

  /**
   * A la soumission du formulaire on récupère les données et on authentifie l'utilisateur
   * Une fois l'utilisateur authentifié on le redirige vers la page dashboard
   * Sinon on affiche l'erreur
   */
  async onSubmitForm(): Promise<any> {
    this.loader = true;
    const email = this.forgottenPswForm.get('email').value;

    this.userService.sendReinitiatePswEmail(email)
        .then(success => {
          if (success) {
            this.emailSent = true;
            this.loader = false;
          } else {
            this.loader = false;
            this.errorMessage = 'Cette adresse mail n\'est liée à aucun compte.';
          }
        });

  }

}
