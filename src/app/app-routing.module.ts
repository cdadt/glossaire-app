import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { AuthenticationComponent } from './authentication/authentication.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { ListWordByThemeComponent } from './theme/list-word-by-theme/list-word-by-theme.component';
import { AddWordComponent } from './word/add-word/add-word.component';
import { SingleWordComponent } from './word/single-word/single-word.component';

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
    path: 'mot/ajouter',
    component: AddWordComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
