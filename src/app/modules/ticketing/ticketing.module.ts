import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketingRoutingModule } from './ticketing-routing.module';
import { TicketingComponent } from './ticketing.component';
import { TktCategoryComponent } from './tkt-category/tkt-category.component';
import { TktIncidentreportComponent } from './tkt-incidentreport/tkt-incidentreport.component';
import { TktInfoComponent } from './tkt-info/tkt-info.component';
import { TktClientmessageComponent } from './tkt-clientmessage/tkt-clientmessage.component';
import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';

@NgModule({
  declarations: [

    
   
  ],
  imports: [
    CommonModule,
    TicketingRoutingModule
  ]
})
export class TicketingModule { }
