import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {AppRoutingModule} from './app-routing.module';
import {FooterComponent} from './footer/footer.component';
import {HeaderComponent} from './header/header.component';
import {HttpClientModule} from '@angular/common/http';
import {WordService} from '../services/word.service';
import {SingleWordComponent} from './word/single-word/single-word.component';
import {ReactiveFormsModule} from '@angular/forms';
import {ListWordComponent} from './word/list-word/list-word.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {AuthenticationComponent} from './authentication/authentication.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {AuthenticationService} from '../services/authentication.service';
import {RegisterComponent} from './register/register.component';
import {AuthGuardService} from '../services/auth-guard.service';
import {MenuAdminComponent} from './menu-admin/menu-admin.component';
import {MDBRootModule} from 'angular-bootstrap-md';
import {AddWordComponent} from './word/add-word/add-word.component';
import {EditWordComponent} from './word/edit-word/edit-word.component';
import {NewsletterService} from '../services/newsletter.service';
import {TimeagoModule, TimeagoIntl, TimeagoFormatter, TimeagoCustomFormatter} from 'ngx-timeago';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

export class MyIntl extends TimeagoIntl {
// do extra stuff here...
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    HeaderComponent,
    SingleWordComponent,
    ListWordComponent,
    AuthenticationComponent,
    DashboardComponent,
    RegisterComponent,
    MenuAdminComponent,
    AddWordComponent,
    EditWordComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('custom-service-worker.js', {enabled: environment.production}),
    ReactiveFormsModule,
    MDBRootModule,
    TimeagoModule.forRoot({
      intl: { provide: TimeagoIntl, useClass: MyIntl },
      formatter: { provide: TimeagoFormatter, useClass: TimeagoCustomFormatter },
    })
  ],
  providers: [
    WordService,
    AuthenticationService,
    AuthGuardService,
    NewsletterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
