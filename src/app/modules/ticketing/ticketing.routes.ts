import { Routes } from '@angular/router';
import { TicketingComponent } from './ticketing.component';
import { TktCategoryComponent } from './tkt-category/tkt-category.component';
import { TktDetailsComponent } from './tkt-details/tkt-details.component';
import { TktCrewComponent } from './tkt-crew/tkt-crew.component';
import { TktClienticketComponent } from './tkt-clienticket/tkt-clienticket.component';
import { TktIncidentreportComponent } from './tkt-incidentreport/tkt-incidentreport.component';
import { TktInfoComponent } from './tkt-info/tkt-info.component';
import { authGuard } from '../../auth.guard';

export const TICKETING_ROUTES: Routes = [
  {
    path: '',
    component: TicketingComponent,
    children: [
      { path: 'ticket_category', component: TktCategoryComponent },
      { path: 'ticket_details', component: TktDetailsComponent },
      { path: 'ticket_details/:id', component: TktDetailsComponent },
      { path: 'ticket_crew', component: TktCrewComponent },
      { path: 'client_ticket', component: TktClienticketComponent },
      { path: 'incident_report', component: TktIncidentreportComponent },
      { path: 'incident_report/:id', component: TktInfoComponent },
      { path: '', redirectTo: 'category', pathMatch: 'full' }
    ],
    canActivate: [authGuard]
  }
];
