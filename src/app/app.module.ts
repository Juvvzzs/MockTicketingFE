import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MainlayoutComponent } from './layout/mainlayout/mainlayout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { LoginComponent } from './login/user-login/user-login.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from 'src/token.interceptor';
import { DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TktCategoryComponent } from './modules/ticketing/tkt-category/tkt-category.component';
import { TktDetailsComponent } from './modules/ticketing/tkt-details/tkt-details.component';
import { TktCrewComponent } from './modules/ticketing/tkt-crew/tkt-crew.component';
import { TktIncidentreportComponent } from './modules/ticketing/tkt-incidentreport/tkt-incidentreport.component';
import { TktClienticketComponent } from './modules/ticketing/tkt-clienticket/tkt-clienticket.component';
import { TktInfoComponent } from './modules/ticketing/tkt-info/tkt-info.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    MainlayoutComponent,
    LoginComponent,
    TktCategoryComponent,
    TktDetailsComponent,
    TktCategoryComponent,
    TktDetailsComponent,
    TktCrewComponent,
    TktIncidentreportComponent,
    TktClienticketComponent,
    TktInfoComponent, 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    NgxSkeletonLoaderModule,
    FontAwesomeModule,
  ],
  providers: [
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
platformBrowserDynamic().bootstrapModule(AppModule);
