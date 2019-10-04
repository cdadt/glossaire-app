import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthAdminGuardService } from '../services/auth-admin-guard.service';
import { AuthEditorGuardService } from '../services/auth-editor-guard.service';
import { AuthUserGuardService } from '../services/auth-user-guard.service';
import { AuthenticationComponent } from './authentication/authentication.component';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FourohfourComponent } from './fourohfour/fourohfour.component';
import { HomeComponent } from './home/home.component';
import { ImportComponent } from './import/import.component';
import { AddEditThemeComponent } from './theme/add-edit-theme/add-edit-theme.component';
import { ListWordByThemeComponent } from './theme/list-word-by-theme/list-word-by-theme.component';
import { ManageThemeComponent } from './theme/manage-theme/manage-theme.component';
import { ForgottenPswComponent } from './user/forgotten-psw/forgotten-psw.component';
import { LookForUserComponent } from './user/look-for-user/look-for-user.component';
import { RegisterComponent } from './user/register/register.component';
import { ReinitiatePswComponent } from './user/reinitiate-psw/reinitiate-psw.component';
import { SingleUserComponent } from './user/single-user/single-user.component';
import { AddWordComponent } from './word/add-word/add-word.component';
import { EditWordComponent } from './word/edit-word/edit-word.component';
import { ManageWordComponent } from './word/manage-word/manage-word.component';
import { SingleWordComponent } from './word/single-word/single-word.component';
import { ValidationWordComponent } from './word/validation-word/validation-word.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'definitions/:id',
    component: SingleWordComponent
  },
  {
    path: 'definitions/edition/:id',
    component: EditWordComponent,
    canActivate: [AuthEditorGuardService]
  },
  {
    path: 'themes/:id/words',
    component: ListWordByThemeComponent
  },
  {
    path: 'connexion',
    component: AuthenticationComponent
  },
  {
    path: 'mot-de-passe-oublie',
    component: ForgottenPswComponent
  },
  {
    path: 'reinitialiser-mot-de-passe/:code',
    component: ReinitiatePswComponent
  },
  {
    path: 'utilisateur/ajouter',
    component: RegisterComponent,
    canActivate: [AuthAdminGuardService]
  },
  {
    path: 'utilisateur/rechercher',
    component: LookForUserComponent,
    canActivate: [AuthAdminGuardService]
  },
  {
    path: 'utilisateur/:id',
    component: SingleUserComponent,
    canActivate: [AuthAdminGuardService]
  },
  {
    path: 'mot/ajouter',
    component: AddWordComponent,
    canActivate: [AuthEditorGuardService]
  },
  {
    path: 'mot/gerer',
    component: ManageWordComponent,
    canActivate: [AuthEditorGuardService]
  },
  {
    path: 'mot/valider',
    component: ValidationWordComponent,
    canActivate: [AuthEditorGuardService]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthUserGuardService]
  },
  {
    path: 'theme/ajouter',
    component: AddEditThemeComponent,
    canActivate: [AuthEditorGuardService]
  },
  {
    path: 'theme/modifier/:id',
    component: AddEditThemeComponent,
    canActivate: [AuthEditorGuardService]
  },
  {
    path: 'theme/gerer',
    component: ManageThemeComponent,
    canActivate: [AuthEditorGuardService]
  },
  {
    path: 'import',
    component: ImportComponent,
    canActivate: [AuthEditorGuardService]
  },
  {
    path: 'favoris',
    component: BookmarkComponent,
    canActivate: [AuthUserGuardService]
  },
  {
    path: '**',
    component: FourohfourComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
