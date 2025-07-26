import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { IncidentList } from '../models/tkt-details.model';
import { IncidentserviceService } from '../service/incidents.service';


@Component({
  selector: 'app-tkt-incidentreport',
  templateUrl: './tkt-incidentreport.component.html',
  styleUrls: ['./tkt-incidentreport.component.css']
})
export class TktIncidentreportComponent implements OnInit {
  incidentList: IncidentList[] = []; // Changed from incidentss to incidents
  loading = true; // Add loading state

  public criticalCount: number = 0;
  public highCount: number = 0;
  public mediumCount: number = 0;
  public lowCount: number = 0;

  constructor(
    private router: Router,
    private IncidentService: IncidentserviceService
  ) { }

  ngOnInit(): void {
    this.loadIncidentReport();
  }

  loadIncidentReport(): void {
    this.IncidentService.getIncidentReports().subscribe({
      next: (data) => {
        this.incidentList = data.map((incident: any) => ({
          ...incident,
          IncID: incident.IncidentID, // Ensure IncID is set
          TktID: incident.ticketCategory, // Ensure TktID is set
          severity: incident.Severity, // Ensure Severity is set
          incidentType: incident.IncidentType || incident.Type, // Ensure IncidentType is set
          reportedBy: incident.ReportedBy || incident.Reporter, // Ensure ReportedBy is set
          CreatedDT: new Date(incident.CreatedDT).toLocaleString(),
          LastUpdatedDT: new Date(incident.LastUpdatedDT).toLocaleString(),
          statusClass: this.getTicketStatusClass(incident.TicketStatus),
          selected: false
        })).sort((a, b) => 
          new Date(b.CreatedDT).getTime() - new Date(a.CreatedDT).getTime()
        );
       this.calculateAnalytics(this.incidentList);
        this.loading = false; // Set loading to false after data is loaded
      },
      error: err => {
        console.error('Failed to load tickets from API', err);
        this.incidentList = [];
      }
    });
  }

  private calculateAnalytics(incidents: IncidentList[]): void {
    this.criticalCount = incidents.filter(
      inc => inc.severity === 'Critical'
    ).length;

    this.highCount = incidents.filter(
      inc => inc.severity === 'High'
    ).length;

    this.mediumCount = incidents.filter(
      inc => inc.severity === 'Medium'
    ).length;

    this.lowCount = incidents.filter(
      inc => inc.severity === 'Low'
    ).length;
  }

  viewDetails(incidentId: string): void {
    this.router.navigate(['/incident_info', incidentId]);
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
    const statusCleaned = this.formatTicketStatus(status).toLowerCase();
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