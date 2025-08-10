import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainlayoutComponent } from './layout/mainlayout/mainlayout.component';
import { LoginComponent } from './login/user-login/user-login.component';
import { TktDetailsComponent } from './modules/ticketing/tkt-details/tkt-details.component';
import { TktCategoryComponent } from './modules/ticketing/tkt-category/tkt-category.component';
import { TktCrewComponent } from './modules/ticketing/tkt-crew/tkt-crew.component';
import { TktClienticketComponent } from './modules/ticketing/tkt-clienticket/tkt-clienticket.component';
import { TktIncidentreportComponent } from './modules/ticketing/tkt-incidentreport/tkt-incidentreport.component';
import { TktInfoComponent } from './modules/ticketing/tkt-info/tkt-info.component';

export const routes: Routes = [
 
  { path: '', redirectTo: '/login', pathMatch: 'full' },


  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainlayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'ticket_details', component: TktDetailsComponent },
      { path: 'ticket_details/:id', component: TktDetailsComponent },
      { path: 'ticket_category', component: TktCategoryComponent },
      { path: 'ticket_crew', component: TktCrewComponent },
      { path: 'client_ticket', component: TktClienticketComponent },
      { path: 'incident_report', component: TktIncidentreportComponent },
      { path: 'incident_info/:id', component: TktInfoComponent, canActivate: [authGuard] }
    ]
  },

  
  { path: '**', redirectTo: '/login' }
];



// No NgModule needed for standalone components
