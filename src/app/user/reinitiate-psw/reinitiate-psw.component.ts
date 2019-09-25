import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-reinitiate-psw',
  templateUrl: './reinitiate-psw.component.html',
  styleUrls: ['./reinitiate-psw.component.css']
})
export class ReinitiatePswComponent implements OnInit {

  reinitializeCode: string;
  pswForm: FormGroup;
  modificationOk: boolean;

  constructor(private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private userService: UserService,
              private toastr: ToastrService,
              private router: Router) { }

  ngOnInit(): void {
    this.onInitForm();
    this.route.params.subscribe(async params => {
      try {
        this.reinitializeCode = params.code;
        const user = await this.userService.verifResetPswCodeExists(this.reinitializeCode);
        this.modificationOk = false;
        if (!user) {
          this.router.navigateByUrl('/404');
        }
      } catch (error) {
        this.router.navigateByUrl('/404');
      }
    });
  }

  onInitForm(): void {
    this.pswForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]/), Validators.minLength(8), Validators.maxLength(30)]]
    });
  }

  onSubmitForm(): void {
    const psw = this.pswForm.get('password').value;

    this.userService.changePassword(this.reinitializeCode, psw)
        .then(success => {
          this.toastr.success('Mot de passe modifié avec succès.');
          this.modificationOk = true;
        })
        .catch(error => this.userService.errorActions(error));
  }
}
