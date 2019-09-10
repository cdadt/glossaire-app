import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { AuthenticationComponent } from './authentication/authentication.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ImportComponent } from './import/import.component';
import { RegisterComponent } from './user/register/register.component';
import { AddEditThemeComponent } from './theme/add-edit-theme/add-edit-theme.component';
import { ListWordByThemeComponent } from './theme/list-word-by-theme/list-word-by-theme.component';
import { ManageThemeComponent } from './theme/manage-theme/manage-theme.component';
import { AddWordComponent } from './word/add-word/add-word.component';
import { EditWordComponent } from './word/edit-word/edit-word.component';
import { ManageWordComponent } from './word/manage-word/manage-word.component';
import { SingleWordComponent } from './word/single-word/single-word.component';
import {LookForUserComponent} from "./user/look-for-user/look-for-user.component";
import {SingleUserComponent} from "./user/single-user/single-user.component";

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
    canActivate: [AuthGuardService]
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
    path: 'utilisateur/ajouter',
    component: RegisterComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'utilisateur/rechercher',
    component: LookForUserComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'utilisateur/:id',
    component: SingleUserComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mot/ajouter',
    component: AddWordComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'mot/gerer',
    component: ManageWordComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'theme/ajouter',
    component: AddEditThemeComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'theme/modifier/:id',
    component: AddEditThemeComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'theme/gerer',
    component: ManageThemeComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'import',
    component: ImportComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
