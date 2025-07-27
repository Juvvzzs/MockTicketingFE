import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { IncidentList, Ticket } from 'src/app/modules/ticketing/models/tkt-details.model';
import { IncidentserviceService } from 'src/app/modules/ticketing/service/incidents.service';
import { TktCreated } from 'src/app/modules/ticketing/models/tkt-created';
import { TktCreatedService } from 'src/app/modules/ticketing/service/tkt-created.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedSeverity: string = 'all';
  filteredIncidents: IncidentList[] = [];
  displayLimit = 6; // Set the default display limit
  loading: boolean = true;
  // Incident reports data
  incidentsList: IncidentList[] = [];

  // Ticket statistics data - will be calculated in constructor
  ticketOverAll: any[] = [];
  ticketStats: any[] = [];
  ticketCountByStatus: Ticket[] = [];


  // Ticket categories data
  ticketCategories = [
    { name: 'HRIS', percentage: 0 },
    { name: 'PASIMS', percentage: 0 },
    { name: 'HEALTH AND WELLNESS', percentage: 0 },
    { name: 'CYBERSECURITY',percentage: 0 },
    { name: 'OTHERS', percentage: 0 }
  ];

  // Incident timeline data
  incidentTimeline = [
    { ticketId: '085563', eventTime: '4/25/25 10:00', timestamp: '2025-04-25T10:00:00' },
    { ticketId: '085564', eventTime: '4/25/25 10:30', timestamp: '2025-04-25T10:30:00' },
    { ticketId: '085565', eventTime: '4/25/25 10:30', timestamp: '2025-04-25T10:30:00' },
    { ticketId: '085566', eventTime: '4/25/25 10:35', timestamp: '2025-04-25T10:35:00' },
    { ticketId: '085567', eventTime: '4/25/25 10:41', timestamp: '2025-04-25T10:41:00' },
    { ticketId: '085568', eventTime: '4/26/25 09:15', timestamp: '2025-04-26T09:15:00' },
    { ticketId: '085569', eventTime: '4/26/25 14:20', timestamp: '2025-04-26T14:20:00' },
    { ticketId: '085570', eventTime: '4/27/25 08:45', timestamp: '2025-04-27T08:45:00' }
  ];

  // Ticket assignments data
  ticketAssignments = [
    { assignmentId: '089996', ticketId: '085566', assignedTo: 'LUX', assignedDate: '4/26/2025', timestamp: '2025-04-26T00:00:00' },
    { assignmentId: '084512', ticketId: '085567', assignedTo: 'ROGEL', assignedDate: '4/27/2025', timestamp: '2025-04-27T00:00:00' },
    { assignmentId: '089996', ticketId: '085568', assignedTo: 'DARWEY', assignedDate: '4/27/2025', timestamp: '2025-04-27T00:00:00' },
    { assignmentId: '087533', ticketId: '085569', assignedTo: 'GAREN', assignedDate: '4/28/2025', timestamp: '2025-04-28T00:00:00' },
    { assignmentId: '028623', ticketId: '085570', assignedTo: 'SYLAS', assignedDate: '4/28/2025', timestamp: '2025-04-28T00:00:00' },
    { assignmentId: '028624', ticketId: '085571', assignedTo: 'MORGAN', assignedDate: '4/29/2025', timestamp: '2025-04-29T00:00:00' },
    { assignmentId: '028625', ticketId: '085572', assignedTo: 'KAYLE', assignedDate: '4/29/2025', timestamp: '2025-04-29T00:00:00' }
  ];

  constructor(private incidentService: IncidentserviceService,
              private ticketCreatedService: TktCreatedService,) {
    // Sort all data by date (newest first)
    this.incidentsList.sort((a, b) => new Date(b.reportDateTime).getTime() - new Date(a.reportDateTime).getTime());
    this.incidentTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.ticketAssignments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.filteredIncidents = this.getLimitedIncidents();
  }


  ngOnInit(): void {
    this.loading = true; 
    this.loadIncidentReport();
    this.loadTickets();
  }

  loadTickets(): void {
 this.ticketCreatedService.getTickets().subscribe({
    next: (data) => {
      console.log('Tickets from API:', data);
      this.ticketCountByStatus = data.map((ticket: any) => ({
        TicketID: ticket.TicketID || '',
        ClientName: ticket.ClientName || '',
        CategoryID: ticket.CategoryID || '',
        CategoryName: ticket.CategoryName || '',
        Subject: ticket.Subject || '',
        Status: ticket.Status || 'NEW',
        CreatedDT: ticket.CreatedDT || '',
        LastUpdatedDT: ticket.LastUpdatedDT || '',
      }))
        this.calculateTicketStats(this.ticketCountByStatus);
        this.checkLoadingDone()
    },
    error: err => {
      console.error('Failed to load tickets from API', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load tickets. Please try again later.'   
        
    })
      this.checkLoadingDone();
  } });

}


  loadIncidentReport(): void {
  this.incidentService.getIncidentReports().subscribe({
    next: (data) => {
      this.incidentsList = data.map((incident: any) => ({
        ...incident,
        IncID: incident.IncidentID,
        TktID: incident.ticketCategory,
        severity: incident.Severity,
        status: incident.Status,
        incidentType: incident.IncidentType || incident.Type,
        reportedBy: incident.ReportedBy || incident.Reporter,
        CreatedDT: new Date(incident.CreatedDT).toLocaleString(),
        LastUpdatedDT: new Date(incident.LastUpdatedDT).toLocaleString(),
        selected: false
      }));
      this.calculateTicketOverAll(this.incidentsList);
      this.calculateCategoryStats();
      this.filteredIncidents = this.getLimitedIncidents();
      this.checkLoadingDone();
    },
    error: err => {
      console.error('Failed to load tickets from API', err);
      this.checkLoadingDone();
    }
  });
}
    pendingRequests = 2; // Add this outside methods

    checkLoadingDone() {
      this.pendingRequests--;
      if (this.pendingRequests === 0) {
        this.loading = false;
      }
    }
  // Get limited incidents (latest 6-7)
  getLimitedIncidents() {
    return this.incidentsList.slice(0, this.displayLimit);
  }

  // Get limited timeline (latest 6-7)
  getLimitedTimeline() {
    return this.incidentTimeline.slice(0, this.displayLimit);
  }

  // Get limited assignments (latest 6-7)
  getLimitedAssignments() {
    return this.ticketAssignments.slice(0, this.displayLimit);
  }

 private calculateTicketStats(ticket: Ticket[]): void {
  
  const newTickets = ticket.filter( stats => stats.Status === 'NEW').length;
  const inProgressTickets = ticket.filter( stats => stats.Status === 'IN PROGRESS').length;
  const resolvedTickets = ticket.filter( stats => stats.Status === 'RESOLVED').length;
  const closedTickets =ticket.filter( stats => stats.Status === 'CLOSED').length;
  
  this.ticketStats = [
    { title: 'Over All Tickets', count: ticket.length }
    
  ];
}

 private calculateTicketOverAll(incident: IncidentList[]): void {
  const totalTickets = incident.length;
  const critical = incident.filter( stats => stats.severity === 'Critical').length;
  const high = incident.filter( stats => stats.severity === 'High').length;
  const medium = incident.filter( stats => stats.severity === 'Medium').length;
  const low =incident.filter( stats => stats.severity === 'Low').length;
  
  this.ticketOverAll = [
    { title: 'Total Incident Reports', count: totalTickets }
 
  ];
}
  private calculateCategoryStats(): void {
    this.ticketCategories = [
      { name: 'HRIS', percentage: 100 },
      { name: 'PASIMS', percentage: 100 },
      { name: 'HEALTH AND WELLNESS', percentage: 100 },
      { name: 'CYBERSECURITY', percentage: 100 },
      { name: 'OTHERS', percentage: 100 }
    ];
  }

  // Filter incidents based on severity
  filterIncidents() {
    if (this.selectedSeverity === 'all') {
      this.filteredIncidents = this.getLimitedIncidents();
    } else {
      this.filteredIncidents = this.incidentsList
        .filter(incident => incident.severity === this.selectedSeverity)
        .slice(0, this.displayLimit);
    }
  }
}