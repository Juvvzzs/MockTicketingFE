import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketingRoutingModule } from './ticketing-routing.module';
import { TicketingComponent } from './ticketing.component';

@NgModule({
  declarations: [
    TicketingComponent
  ],
  imports: [
    CommonModule,
    TicketingRoutingModule
  ]
})
export class TicketingModule { }
