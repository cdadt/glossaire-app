import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import User from '../../models/user.model';

@Component({
  selector: 'app-single-user',
  templateUrl: './single-user.component.html',
  styleUrls: ['./single-user.component.css']
})
export class SingleUserComponent implements OnInit {

  user: User;
  editForm: FormGroup;
  message: string;
  edit = false;
  inputs = (document.getElementsByTagName('input') as HTMLCollectionOf<HTMLInputElement>);

  constructor(private userService: UserService,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(async params => {
      this.user = await this.userService.getUserById(params.id) as User;
      this.editForm.patchValue(this.user);
    });
  }

  /**
   * Initialisation du formulaire avec la méthode réactive.
   */
  initForm(): void {
    this.editForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(60)]],
      password: [''],
      firstname: [''],
      lastname: [''],
      activated: ['']
    });
  }

  /**
   * Défintion des règles de validation au changement du contenu de l'input password.
   * Nécessaire pour permettre d'avoir soit vide (pas de modif du mdp) soit saisit avec les règles.
   * @param event : keyup
   */
  setPasswordValidators(event): void {
    const value = this.editForm.controls.password.value;
    if (value.length > 0) {
      this.editForm.controls.password.setValidators([Validators.pattern(/[0-9a-zA-Z]/),
                                                     Validators.minLength(8), Validators.maxLength(30)]);
    } else {
      this.editForm.controls.password.clearValidators();
    }
    this.editForm.controls.password.updateValueAndValidity();
  }

  /**
   * Activation du mode édition.
   */
  activeEdit(): void {
    this.edit = true;

    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].removeAttribute('disabled');
    }
  }

  /**
   * Désactivation du mode édition.
   */
  cancelEdit(): void {
    this.edit = false;

    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].setAttribute('disabled', 'disabled');
    }

    this.editForm.patchValue(this.user);
  }

  /**
   * Soumission du formulaire de modification d'un utilisateur.
   */
  async onSubmitForm(): Promise<any> {
    if (this.editForm.valid) {
      this.user.username = this.editForm.get('username').value;
      this.user.email = this.editForm.get('email').value;
      this.user.password = this.editForm.get('password').value;
      this.user.firstname = this.editForm.get('firstname').value;
      this.user.lastname = this.editForm.get('lastname').value;
      this.user.activated = this.editForm.get('activated').value;
      if (this.editForm.get('password').value && this.editForm.get('password').value !== '') {
        this.user.password = this.editForm.get('password').value;
      }
      this.userService.update(this.user);
      this.cancelEdit();
    }
  }
}