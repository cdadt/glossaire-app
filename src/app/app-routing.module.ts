import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {SingleWordComponent} from './word/single-word/single-word.component';
import {ListWordComponent} from './word/list-word/list-word.component';
import {AuthenticationComponent} from './authentication/authentication.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {RegisterComponent} from './register/register.component';
import {AuthGuardService} from '../services/auth-guard.service';
import {AddWordComponent} from './word/add-word/add-word.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'definition/:title',
    component: SingleWordComponent
  },
  {
    path: 'theme/:title',
    component: ListWordComponent
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
