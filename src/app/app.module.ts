import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MDBRootModule } from 'angular-bootstrap-md';
import { TimeagoCustomFormatter, TimeagoFormatter, TimeagoIntl, TimeagoModule } from 'ngx-timeago';
import { ToastrModule } from 'ngx-toastr';
import { environment } from '../environments/environment';
import { AuthGuardService } from '../services/auth-guard.service';
import { AuthenticationService } from '../services/authentication.service';
import { IndexedDbService } from '../services/indexed-db.service';
import { NotificationService } from '../services/notification.service';
import { OcrService } from '../services/ocr.service';
import { OnlineOfflineService } from '../services/online-offline.service';
import { SearchService } from '../services/search.service';
import { SyncService } from '../services/sync.service';
import { WordService } from '../services/word.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { MenuAdminComponent } from './menu-admin/menu-admin.component';
import { RegisterComponent } from './register/register.component';
import { AddThemeComponent } from './theme/add-theme/add-theme.component';
import { ListWordByThemeComponent } from './theme/list-word-by-theme/list-word-by-theme.component';
import { AddWordComponent } from './word/add-word/add-word.component';
import { EditWordComponent } from './word/edit-word/edit-word.component';
import { SingleWordComponent } from './word/single-word/single-word.component';

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
    AuthenticationComponent,
    DashboardComponent,
    RegisterComponent,
    MenuAdminComponent,
    AddWordComponent,
    EditWordComponent,
    ListWordByThemeComponent,
    AddThemeComponent
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
      formatter: { provide: TimeagoFormatter, useClass: TimeagoCustomFormatter }
    }),
    BrowserAnimationsModule,
    ToastrModule.forRoot()
  ],
  providers: [
    WordService,
    AuthenticationService,
    AuthGuardService,
    NotificationService,
    SyncService,
    OnlineOfflineService,
    IndexedDbService,
    SearchService,
    OcrService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
