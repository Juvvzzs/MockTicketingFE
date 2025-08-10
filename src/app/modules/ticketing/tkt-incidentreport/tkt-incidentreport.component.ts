import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IncidentList } from '../models/tkt-details.model';
import { IncidentserviceService } from '../service/incidents.service';

@Component({
  selector: 'app-tkt-incidentreport',
  templateUrl: './tkt-incidentreport.component.html',
  styleUrls: ['./tkt-incidentreport.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class TktIncidentreportComponent implements OnInit {
  incidentList: IncidentList[] = [];
  filteredIncidentList: IncidentList[] = [];
  paginatedIncidentList: IncidentList[] = [];
  loading = true;

  itemsPerPage: number = 5;
  currentPage: number = 1;

  public criticalCount: number = 0;
  public highCount: number = 0;
  public mediumCount: number = 0;
  public lowCount: number = 0;

  // Filters
  selectedSeverity = '';
  selectedType = '';
  selectedStatus = '';
  searchTerm = '';
  startDate: Date | null = null;
  


  severityOptions = [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' }
  ];

  incidentTypeOptions = [
    { label: 'Malware', value: 'Malware' },
    { label: 'Phishing', value: 'Phishing' },
    { label: 'Authentication Failure', value: 'Authentication Failure' },
    { label: 'Network Outage', value: 'Network' },
    { label: 'Data Breach', value: 'Data Breach' },
    { label: 'Other', value: 'Other' }
  ];

  statusOptions = [
    { label: 'New', value: 'NEW' },
    { label: 'In Progress', value: 'IN PROGRESS' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Closed', value: 'CLOSED' }
  ];

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
          IncID: incident.IncidentID,
          TktID: incident.ticketCategory,
          severity: incident.Severity,
          incidentType: incident.IncidentType || incident.Type,
          reportedBy: incident.ReportedBy || incident.Reporter,
          CreatedDT: new Date(incident.CreatedDT),
          LastUpdatedDT: new Date(incident.LastUpdatedDT),
          statusClass: this.getTicketStatusClass(incident.TicketStatus),
          selected: false
        })).sort((a, b) => b.CreatedDT.getTime() - a.CreatedDT.getTime());

        this.calculateAnalytics(this.incidentList);
        this.applyFilters(); // apply filters initially
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load tickets from API', err);
        this.incidentList = [];
        this.paginatedIncidentList = [];
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.incidentList];

    if (this.selectedSeverity) {
      filtered = filtered.filter(i => i.severity === this.selectedSeverity);
    }

    if (this.selectedType) {
      filtered = filtered.filter(i => i.incidentType === this.selectedType);
    }

    if (this.selectedStatus) {
      const cleanStatus = this.formatTicketStatus(this.selectedStatus).toLowerCase();
      filtered = filtered.filter(i => this.formatTicketStatus(i.status).toLowerCase() === cleanStatus);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        (i.IncID && i.IncID.toLowerCase().includes(term)) ||
        (i.TktID && i.TktID.toLowerCase().includes(term))
      );
    }

    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter(i => i.reportDateTime >= start);
    }

  
    this.filteredIncidentList = filtered;
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedIncidentList = this.filteredIncidentList.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredIncidentList.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  getFirstItemOnPage(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getLastItemOnPage(): number {
    const lastItem = this.currentPage * this.itemsPerPage;
    return lastItem > this.filteredIncidentList.length ? this.filteredIncidentList.length : lastItem;
  }

  private calculateAnalytics(incidents: IncidentList[]): void {
    this.criticalCount = incidents.filter(i => i.severity === 'Critical').length;
    this.highCount = incidents.filter(i => i.severity === 'High').length;
    this.mediumCount = incidents.filter(i => i.severity === 'Medium').length;
    this.lowCount = incidents.filter(i => i.severity === 'Low').length;
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
