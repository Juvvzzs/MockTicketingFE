import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IncidentserviceService } from '../service/incidents.service';
import { IncidentReport } from '../models/tkt-details.model';

@Component({
  selector: 'app-tkt-info',
  templateUrl: './tkt-info.component.html',
  styleUrls: ['./tkt-info.component.css']
})
export class TktInfoComponent implements OnInit {
  incident: IncidentReport | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private incidentService: IncidentserviceService
  ) { }

  ngOnInit(): void {
    this.loadIncidentReportById();
  }

  loadIncidentReportById(): void {
  const id = this.route.snapshot.paramMap.get('id');
  console.log('Route ID:', id); // Check if ID exists
  
  if (!id) {
    console.error('No incident ID in route');
    this.loading = false;
    return;
  }

  this.incidentService.getIncidentById(id).subscribe({
    next: (incident) => {
      console.log('API Response:', incident); // Check the received data
      this.incident = incident;
      this.loading = false;
    },
    error: (err) => {
      console.error('Error loading incident:', err);
      this.loading = false;
    },
    complete: () => console.log('Request completed') // Verify completion
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