import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TktAdminviewService } from '../service/tkt-adminview.service';
import { Ticket, StatusOption, IncidentReport } from '../models/tkt-details.model';
import { TktCrtincReportService } from '../service/tkt-crtinc-report.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-tkt-details',
  templateUrl: './tkt-details.component.html',
  styleUrls: ['./tkt-details.component.css']
})
export class TktDetailsComponent {
  tickets: Ticket[] = [];
  incReport_Ticket: IncidentReport [] =[]; 
  showTicketModal = false;
  showModal = false;
  selectedTicket: any = null;
  selectedRow: any = null;
  error: string | undefined;
  submitting: boolean | undefined;
  successMessage: string | undefined;

  

  incReportForm = {
    IncidentID: '',
    ticketCategory: '',
    Severity: '',
    IncidentType: '',
    ReportedBy: '',
    
}

  // Dropdown options for incident report
  severityOptions = [
    { value: '', label: 'Select Severity' },
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  incidentTypeOptions = [
    { value: '', label: 'Select Incident Type' },
    { value: 'Malware', label: 'Malware' },
    { value: 'Phishing', label: 'Phishing' },
    { value: 'DDoS', label: 'DDoS' },
    { value: 'Data Breach', label: 'Data Breach' },
    { value: 'Unauthorized Access', label: 'Unauthorized Access' },
    { value: 'Insider Threat', label: 'Insider Threat' },
    { value: 'Ransomware', label: 'Ransomware' },
    { value: 'Other', label: 'Other' }
  ];

  // Form model for incident report
  incidentReportData = {
    severity: '',
    incidentType: ''
  };

  // Status options for ticket status dropdown
  statusOptions: StatusOption[] = [
    { value: 'new', label: 'New' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  constructor(
    private tktAdminviewService: TktAdminviewService,
    private tktCrtincReportService: TktCrtincReportService,
    private router : Router
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.tktAdminviewService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data.map((ticket: any) => ({
          TicketID: ticket.TicketID || '',
          ClientName: ticket.ClientName || 'Unknown',
          CategoryName: ticket.CategoryName || ticket.CategoryID || '',
          Subject: ticket.Subject || '',
          Description: ticket.Description || '',
          Status: ticket.Status || 'NEW',
          CreatedDT: ticket.CreatedDT || new Date().toISOString(),
          LastUpdatedDT: ticket.LastUpdatedDT || new Date().toISOString(),
          statusClass: this.getStatusClass(ticket.Status)
        })).sort((a, b) => 
          new Date(b.CreatedDT).getTime() - new Date(a.CreatedDT).getTime()
        );
      },
      error: err => {
        console.error('Failed to load tickets from API', err);
        this.tickets = [];
      }
    });
  }

  getStatusClass(status: string): string {
    if (!status) return 'new';
    
    const statusMap: {[key: string]: string} = {
      'new': 'new',
      'in progress': 'in-progress',
      'paused': 'in-progress',
      'resolve': 'resolved',
      'closed': 'closed'
    };

    const statusLower = status.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (statusLower.includes(key)) {
        return value;
      }
    }
    
    return statusLower; 
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  openTicket(ticketId: string) {
    this.selectedTicket = this.tickets.find(t => t.TicketID === ticketId);
    
    if (this.selectedTicket) {
      const statusClass = this.getStatusClass(this.selectedTicket.Status);
      this.selectedTicket.statusClass = statusClass;
      this.selectedTicket.currentStatus = statusClass === 'paused' ? 'in-progress' : statusClass;
    }
    this.showModal = true;
  }

  getStatusDropdownClass(status: string): string {
    const statusClass = this.getStatusClass(status);
    return statusClass === 'paused' ? 'in-progress' : statusClass;
  }

  closeModal() {
    this.showModal = false;
    this.selectedTicket = null;
  }

  closeIncidentModal() {
    this.showTicketModal = false;
    this.incidentReportData = { severity: '', incidentType: '' };
  }

    NewOpenCount(): number {
    return this.tickets.filter(ticket => ticket.Status === 'NEW').length;
  }
  InProgressCount(): number {
    return this.tickets.filter(ticket => ticket.Status === 'IN PROGRESS').length;
  }
  ResolveCount(): number {
    return this.tickets.filter(ticket => ticket.Status === 'RESOLVED').length;
  }
  ClosedTicketCount(): number {
    return this.tickets.filter(ticket => ticket.Status === 'CLOSED').length;
  }
 
  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeIncidentModal();
    }
  }
  
  CreateIncReport(): void {
  if (!this.selectedRow) {
    this.error = 'Please select a ticket row first.';
    return;
  }
  
  // Initialize form with selected row data
  this.incReportForm = {
    IncidentID: '',
    ticketCategory: this.selectedRow.CategoryName || '',
    Severity: '',
    IncidentType: '',
    ReportedBy: this.selectedRow.ClientName || ''
  };
  
  this.error = ''; // Clear any previous errors
  this.showTicketModal = true;
}

 SubmitIncidentReport(): void {
  // Validate form data
  if (!this.incReportForm.Severity || !this.incReportForm.IncidentType) { 
    this.error = 'Please fill in all required fields.';
    return;
  }

  // Check if we have a selected ticket
  if (!this.selectedRow) {
    this.error = 'No ticket selected. Please select a ticket first.';
    return;
  }

  this.tktCrtincReportService.getIncidentReports().subscribe({
    next: (incReport_Ticket) => {
      // Check if this ticket already has an incident report
      const existingReport = incReport_Ticket.find(report => 
        report.ReportedBy === this.selectedRow.ClientName && 
        report.ticketCategory === this.selectedRow.CategoryName &&
        new Date(report.ReportDateTime).getTime() === new Date(this.selectedRow.CreatedDT).getTime()
      );

      if (existingReport) {
        this.error = 'An incident report already exists for this ticket.';
        return;
      }

      // Extract numeric part of ID and find the max
      const maxIdNum = incReport_Ticket.reduce((max, report) => {
        const match = report.IncidentID.match(/^INC-(\d{3})$/);
        const num = match ? parseInt(match[1], 10) : 0;
        return Math.max(max, num);
      }, 0);

      const nextIdNum = maxIdNum + 1;
      const paddedNum = nextIdNum.toString().padStart(3, '0');
      const nextId = `INC-${paddedNum}`;

      const newIncidentReport: IncidentReport = {
        IncidentID: nextId,
        ticketCategory: this.selectedRow.CategoryName || '',
        Severity: this.incReportForm.Severity as 'Critical' | 'High' | 'Medium' | 'Low',
        IncidentType: this.incReportForm.IncidentType,
        ImpactAssessment: 'Write Something......',
        ContainmentActions: 'Write Something ......',
        EradicationSteps: 'Write Eradication Steps......',
        RecoveryProcess: 'Write Recovery Process......',
        LessonsLearned: 'Write Lessons Learned......',
        ReportedToAuthorities: false,
        ReportDateTime: this.selectedRow?.CreatedDT,
        ReportedBy: this.selectedRow?.ClientName || '',
        Status: this.selectedRow?.Status // Default status for new incident report
      };

      this.tktCrtincReportService.SubmitIncidentReport(newIncidentReport).subscribe({
          next: () => {
          Swal.fire({
              icon: 'success',
              title: 'Ticket Created!',
              text: 'Incident report was created successfully.',
              showCancelButton: true,
              confirmButtonText: 'View Incident Report',
              cancelButtonText: 'No',
              confirmButtonColor: '#d33',
              cancelButtonColor: '#aaa'
            }).then((result) => {
              // Close modal regardless of choice
              this.showTicketModal = false;
              this.successMessage = '';

              if (result.isConfirmed) {
                this.router.navigate(['/incident_report']);
              }
            });
        },
        error: (error) => {
          this.submitting = false;
          this.error = 'Failed to create incident report. Please try again.';
          console.error('Error creating incident report:', error);
        }
      });
    },
    error: (err) => {
      this.submitting = false;
      this.error = 'Failed to fetch existing tickets.';
      console.error(err);
    }
  });
}

// Update your resetForm method to return the default form:
resetForm(): any {
  return {
    IncidentID: '',
    ticketCategory: '',
    Severity: '',
    IncidentType: '',
    ReportedBy: ''
  };
}

  
onRowClick(ticket: any): void {
  if (this.selectedRow === ticket) {
    this.selectedRow = null;
    this.incReportForm = this.resetForm(); // Clear form when deselecting
  } else {
    this.selectedRow = ticket;
    // Initialize form with selected ticket data
    this.incReportForm = {
      IncidentID: '',
      ticketCategory: this.selectedRow?.CategoryName || '',
      Severity: '',
      IncidentType: '',
      ReportedBy: this.selectedRow?.ClientName || '',


    };
  }
}


}
