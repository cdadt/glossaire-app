import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TokenPayload } from '../../../services/authentication.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  authForm: FormGroup;
  credentials: TokenPayload = {
    username: '',
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    activated: false,
    permissions: 0
  };
  selectedRight: any;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private toastr: ToastrService) {
  }

  ngOnInit(): any {
    this.initForm();
  }

  /**
   * Initialisation du formulaire de connexion avec la méthide réactive
   */
  initForm(): void {
    this.authForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(60)]],
      password: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]/), Validators.minLength(8), Validators.maxLength(30)]],
      firstname: [''],
      lastname: [''],
      activated: [false],
      selectedRight: ['', Validators.required]
    });
  }

  /**
   * A la soumission du formulaire on récupère les données et on authentifie l'utilisateur
   * Une fois l'utilisateur authentifié on le redirige vers la page dashboard
   * Sinon on affiche l'erreur
   */
  async onSubmitForm(): Promise<any> {
    if (this.authForm.valid) {
      const username = this.authForm.get('username').value;
      const email = this.authForm.get('email').value;
      const password = this.authForm.get('password').value;
      const firstname = this.authForm.get('firstname').value;
      const lastname = this.authForm.get('lastname').value;
      const activated = this.authForm.get('activated').value;
      const permissions = this.authForm.get('selectedRight').value;

      this.credentials.username = username;
      this.credentials.email = email;
      this.credentials.password = password;
      this.credentials.firstname = firstname;
      this.credentials.lastname = lastname;
      this.credentials.activated = activated;
      this.credentials.permissions = permissions;

      await this.userService.register(this.credentials)
          .then(success => {
            this.authForm.reset();
            this.toastr.success('L\'utilisateur vient d\'être ajouté');
          },
              err => {
            this.userService.errorActions(err);
              });
    } else {
      this.toastr.error('Veuillez vérifier les informations renseignées.', 'Le formulaire n\'est pas valide.');
    }
  }

  /**
   * Méthode permettant de réinitialiser le formulaire
   */
  onNew(): void {
    this.authForm.reset();
  }

}
