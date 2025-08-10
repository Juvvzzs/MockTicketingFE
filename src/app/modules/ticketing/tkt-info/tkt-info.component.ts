import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IncidentserviceService } from '../service/incidents.service';
import { IncidentReport } from '../models/tkt-details.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tkt-info',
  templateUrl: './tkt-info.component.html',
  styleUrls: ['./tkt-info.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class TktInfoComponent implements OnInit {
  incident: IncidentReport | null = null;
  editableIncident: IncidentReport | null = null;
  loading = true;
  isEditMode = false;
  isSaving = false;

  constructor(
    private route: ActivatedRoute,
    private incidentService: IncidentserviceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadIncidentReportById();
  }

  loadIncidentReportById(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.error('No incident ID in route');
      this.loading = false;
      return;
    }

    this.incidentService.getIncidentById(id).subscribe({
      next: (incident) => {
        this.incident = incident;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading incident:', err);
        this.loading = false;
      }
    });
  }

  viewTicketDetails(): void {
    if (!this.incident?.ticketID) {
    console.error('TicketID not found.');
    return;
  }

  this.router.navigate(['/ticket_details'], {
    queryParams: {
      id: this.incident.ticketID,
      openTicket: 'true'
    }
  });
}

  toggleEditMode(): void {
    if (!this.isEditMode) {
      this.editableIncident = { ...this.incident } as IncidentReport;
      this.isEditMode = true;
    } else {
      this.saveEditedIncident();
    }
  }

  saveEditedIncident(): void {
    if (!this.editableIncident || !this.incident?.IncidentID) return;

    this.isSaving = true;

    this.incidentService.updateIncident(this.incident.IncidentID, this.editableIncident).subscribe({
      next: (updated) => {
        this.incident = { ...updated };
        this.isEditMode = false;
        this.editableIncident = null;
        this.isSaving = false;

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Incident updated successfully.',
          confirmButtonColor: '#3085d6'
        });
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update incident. Please try again.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  getSeverityClass(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'pill-critical';
      case 'high': return 'pill-high';
      case 'medium': return 'pill-medium';
      case 'low': return 'pill-low';
      default: return 'pill-low';
    }
  }

  getTicketStatusClass(status: string): string {
    if (!status) return 'pill-low';
    const statusCleaned = status.toLowerCase().replace(/\d+\s*/, '');
    switch (statusCleaned) {
      case 'new': return 'pill-new';
      case 'in progress': return 'pill-in-progress';
      case 'resolved': return 'pill-resolved';
      case 'closed': return 'pill-closed';
      default: return 'pill-low';
    }
  }

  formatTicketStatus(status: string): string {
    if (!status) return '';
    return status.replace(/\d+\s*/, '');
  }
}
