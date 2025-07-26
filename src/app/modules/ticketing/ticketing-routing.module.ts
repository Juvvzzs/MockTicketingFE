import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';  
import { MainlayoutComponent } from 'src/app/layout/mainlayout/mainlayout.component';
import { TktDetailsComponent } from './tkt-details/tkt-details.component';

const routes: Routes = [
  {
  
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
})
export class TicketingRoutingModule {}
