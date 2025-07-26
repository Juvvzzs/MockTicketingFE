import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  selectedSeverity: string = 'all';
  filteredIncidents: any[] = [];
  displayLimit = 6; // Set the default display limit

  // Incident reports data
  incidents = [
    { ticketId: '085563', description: 'Malware Issues', severity: 'critical', status: 'pending', date: '2025-04-25T10:00:00' },
    { ticketId: '085564', description: 'Phishing Issues', severity: 'high', status: 'pending', date: '2025-04-25T10:30:00' },
    { ticketId: '085565', description: 'DDos Issues', severity: 'critical', status: 'in-progress', date: '2025-04-25T10:30:00' },
    { ticketId: '085566', description: 'Data Breach Issues', severity: 'medium', status: 'closed', date: '2025-04-25T10:35:00' },
    { ticketId: '085567', description: 'Malware Issues', severity: 'critical', status: 'pending', date: '2025-04-25T10:41:00' },
    { ticketId: '085568', description: 'Phishing Issues', severity: 'high', status: 'closed', date: '2025-04-26T09:15:00' },
    { ticketId: '085569', description: 'DDos Issues', severity: 'critical', status: 'in-progress', date: '2025-04-26T14:20:00' },
    { ticketId: '085570', description: 'Ransomware Attack', severity: 'critical', status: 'pending', date: '2025-04-27T08:45:00' },
    { ticketId: '085571', description: 'Unauthorized Access', severity: 'high', status: 'in-progress', date: '2025-04-28T11:30:00' }
  ];

  // Ticket statistics data - will be calculated in constructor
  ticketStats: any[] = [];

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

  constructor() {
    // Sort all data by date (newest first)
    this.incidents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.incidentTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.ticketAssignments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    this.calculateTicketStats();
    this.calculateCategoryStats();
    this.filteredIncidents = this.getLimitedIncidents();
  }

  // Get limited incidents (latest 6-7)
  getLimitedIncidents() {
    return this.incidents.slice(0, this.displayLimit);
  }

  // Get limited timeline (latest 6-7)
  getLimitedTimeline() {
    return this.incidentTimeline.slice(0, this.displayLimit);
  }

  // Get limited assignments (latest 6-7)
  getLimitedAssignments() {
    return this.ticketAssignments.slice(0, this.displayLimit);
  }

  // Calculate ticket statistics based on incident data
  private calculateTicketStats(): void {
    const totalTickets = this.incidents.length;
    const pendingTickets = this.incidents.filter(ticket => ticket.status === 'pending').length;
    const inProgressTickets = this.incidents.filter(ticket => ticket.status === 'in-progress').length;
    const closedTickets = this.incidents.filter(ticket => ticket.status === 'closed').length;

    this.ticketStats = [
      { title: 'Tickets', count: totalTickets },
      { title: 'Pending Tickets', count: pendingTickets },
      { title: 'In Progress', count: inProgressTickets },
      { title: 'Closed', count: closedTickets }
    ];
  }

  private calculateCategoryStats(): void {
    const totalTickets = this.incidents.length;
    
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
      this.filteredIncidents = this.incidents
        .filter(incident => incident.severity === this.selectedSeverity)
        .slice(0, this.displayLimit);
    }
  }
}