  import { Component } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { ActivatedRoute, Router, RouterModule } from '@angular/router';
  import { TktAdminviewService } from '../service/tkt-adminview.service';
  import { Ticket, StatusOption, IncidentReport } from '../models/tkt-details.model';
  import { TktCrtincReportService } from '../service/tkt-crtinc-report.service';
  import { TktCategoryService } from '../service/tkt-category.service';
  import { TktCategory } from '../models/tkt-category';
  import { TktDemochatService } from '../service/tkt-demochat.service';
  import Swal from 'sweetalert2';
  import { tap, switchMap } from 'rxjs';

  interface Message {
  messageId: number;
  sender: string;
  role: string;
  content: string;
  time: string;
  attachments: { name: string; type: string; url?: string }[];
  type: string;
  isStatusChange?: boolean;
}


  interface Status {
    value: string;
  } 

  @Component({
    selector: 'app-tkt-details',
    templateUrl: './tkt-details.component.html',
    styleUrls: ['./tkt-details.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule
    ]
})

  export class TktDetailsComponent {
     private previousStatus = '';
    categories: TktCategory[] = [];
    tickets: Ticket[] = [];
    incReport_Ticket: IncidentReport [] =[]; 
    showTicketModal = false;
    showModal = false;
    selectedTicket: any = null;
    selectedRow: any = null;
    error: string | undefined;
    submitting: boolean | undefined;
    successMessage: string | undefined;
    paginatedTickets: Ticket[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 10;

    totalPages: number = 0;
    startIndex: number = 0;
    endIndex: number = 0;

    filteredTickets: Ticket[] = [];
    selectedStatus: string = 'all';
    selectedDateRange: string = 'all';
    selectedCategory: string = 'all';

  isChatDisabled = false;
  showMessageModal = false;
  currentTicketId: string = '';
  messages: Message[] = [];
  newMessage = '';
  initialAttachments: File[] = [];
  attachments: File[] = [];

    status: Status [] = [
      { value: 'NEW'},
      { value: 'IN PROGRESS'},
      { value: 'RESOLVED'},
      { value: 'CLOSED'}
    ];

    incReportForm = {
      IncidentID: '',
      TicketID:'',
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
      private tktCategoryService: TktCategoryService,
      private chatService: TktDemochatService,
      private router : Router,
       private route: ActivatedRoute
    ) {}

   ngOnInit(): void {
  this.selectedStatus = 'all';
  this.selectedDateRange = 'all';
  this.selectedCategory = 'all';
  this.loadCategories();
  
  // Chain the operations properly
  this.tktAdminviewService.getTickets().pipe(
    tap(data => {
      this.processTicketData(data);
    }),
    switchMap(() => this.route.queryParamMap)
  ).subscribe(params => {
    const ticketId = params.get('id');
    const openTicket = params.get('openTicket');

    if (ticketId && openTicket === 'true') {
      this.openTicket(ticketId); 
    }
  });
}

private processTicketData(data: any): void {
  this.tickets = data.map((ticket: any) => ({
    TicketID: ticket.TicketID || '',
    ClientName: ticket.ClientName || 'Unknown',
    CategoryName: ticket.CategoryName || ticket.CategoryID || '',
    CategoryID: ticket.CategoryID || '',
    Subject: ticket.Subject || '',
    Description: ticket.Description || '',
    Status: ticket.Status || 'NEW',
    CreatedDT: ticket.CreatedDT || new Date().toISOString(),
    LastUpdatedDT: ticket.LastUpdatedDT || new Date().toISOString(),
    statusClass: this.getStatusClass(ticket.Status)
  })
  );
  
  this.filteredTickets = [...this.tickets];
  this.updatePagination();
}

    loadCategories(): void {
      this.tktCategoryService.getTicketCategory().subscribe({
        next: (data: TktCategory[]) => {
          this.categories = data.filter(cat => cat.Status === 'Enabled');
        },
        error: err => {
          console.error('Failed to load categories', err);
        }
      });
    }

    loadTickets(): void {
    this.tktAdminviewService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data.map((ticket: any) => ({
          TicketID: ticket.TicketID || '',
          ClientName: ticket.ClientName || 'Unknown',
          CategoryName: ticket.CategoryName || ticket.CategoryID || '',
          CategoryID: ticket.CategoryID || '', // Make sure to include CategoryID
          Subject: ticket.Subject || '',
          Description: ticket.Description || '',
          Status: ticket.Status || 'NEW',
          CreatedDT: ticket.CreatedDT || new Date().toISOString(),
          LastUpdatedDT: ticket.LastUpdatedDT || new Date().toISOString(),
          statusClass: this.getStatusClass(ticket.Status)
        })).sort((a, b) => 
          new Date(b.CreatedDT).getTime() - new Date(a.CreatedDT).getTime()
        );
        
        this.filteredTickets = [...this.tickets];
        this.updatePagination();
      },
      error: err => {
        console.error('Failed to load tickets from API', err);
        this.tickets = [];
        this.filteredTickets = [];
        this.updatePagination();
      }
    });
  }

    applyFilters(): void {
  this.filteredTickets = this.tickets.filter(ticket => {
    // Status filter
    const statusMatch = this.selectedStatus === 'all' || 
                       ticket.Status.toLowerCase() === this.selectedStatus.toLowerCase();
    
    // Category filter
    const categoryMatch = this.selectedCategory === 'all' || 
                         ticket.CategoryName === this.selectedCategory;
    
    // Date range filter
    let dateMatch = true;
    if (this.selectedDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const ticketDate = new Date(ticket.CreatedDT);
      
      switch (this.selectedDateRange) {
        case 'today':
          dateMatch = ticketDate >= today;
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateMatch = ticketDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          dateMatch = ticketDate >= monthAgo;
          break;
      }
    }
    
    return statusMatch && categoryMatch && dateMatch;
  });

  this.currentPage = 1;
  this.updatePagination();
}

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTickets.length / this.itemsPerPage);
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.filteredTickets.length);
    this.paginatedTickets = this.filteredTickets.slice(this.startIndex, this.endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
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

      let ticket = this.tickets.find(t => t.TicketID === ticketId);
  
  // If not found, try filtered tickets
  if (!ticket) {
    ticket = this.filteredTickets.find(t => t.TicketID === ticketId);
  }
  
  // If still not found, show error
  if (!ticket) {
    console.error(`Ticket with ID ${ticketId} not found`);
    return;
  }
      this.selectedTicket = this.tickets.find(t => t.TicketID === ticketId);
      this.currentTicketId = ticketId; // ← Add this line
      this.loadMessages(ticketId);
      this.messages = this.chatService.getMessages(ticketId);
      this.newMessage = '';

      if (this.selectedTicket) {
        const statusClass = this.getStatusClass(this.selectedTicket.Status);
        this.selectedTicket.statusClass = statusClass;
        this.isChatDisabled = ['RESOLVED', 'CLOSED'].includes(
          this.tickets.find(t => t.TicketID === ticketId)?.Status || ''
        );
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

    onStatusChange(newStatus: string): void {
    if (!this.currentTicketId || !this.selectedTicket) return;

    this.previousStatus = this.selectedTicket.status;
    this.selectedTicket.status = newStatus;
    this.selectedTicket.updated = new Date().toLocaleString();
    this.selectedTicket.statusClass = this.normalizeStatusClass(this.selectedTicket.status);
    this.isChatDisabled = ['CLOSED'].includes(newStatus);

    this.addStatusChangeMessage(this.currentTicketId, newStatus);
    this.updateTicketStatus(this.selectedTicket);

  }

   private addStatusChangeMessage(ticketId: string, newStatus: string): void {
      const statusMessage = `Ticket status changed to ${newStatus}`;
  
      const systemMsg: Message = {
        messageId: Date.now(),
        sender: 'System',
        role: 'System',
        content: statusMessage,
        time: new Date().toLocaleTimeString(),
        attachments: [],
        type: 'system',
        isStatusChange: true
      };
  
      this.chatService.sendMessage(ticketId, systemMsg);
      this.messages.push(systemMsg);
      this.scrollToBottom();
    }
  private normalizeStatusClass(status: string): string {
      if (!status) return 'new';
  
      const statusLower = status.toLowerCase().trim();
  
      if (statusLower.includes('progress') || statusLower.includes('paused')) {
        return 'in-progress';
      }
      if (statusLower.includes('resolve')) {
        return 'resolved';
      }
      if (statusLower.includes('close')) {
        return 'closed';
      }
      return statusLower;
    }
    getFirstItemOnPage(): number {
      return this.startIndex + 1;
    }
  
    getLastItemOnPage(): number {
      return Math.min(this.endIndex, this.filteredTickets.length);
    }
  
    getTotalPages(): number {
      return Math.ceil(this.filteredTickets.length / this.itemsPerPage);
    }
  
    updateTicketStatus(ticket: Ticket): void {
      if (!ticket?.TicketID) return;
  
      this.tktAdminviewService.updateTicketStatus(ticket.TicketID, ticket.Status).subscribe({
        next: () => {
          console.log('Status updated successfully!');
          this.addStatusChangeMessage(ticket.TicketID, `Status confirmed as ${ticket.Status}`);
        },
        error: (err) => {
          console.error('Error updating status:', err);
          if (this.selectedTicket) {
            this.selectedTicket.status = this.previousStatus;
            this.addStatusChangeMessage(ticket.TicketID,
              `Failed to update status to ${ticket.Status}. Reverted to ${this.previousStatus}`);
          }
        }
      });
    }
      NewOpenCount(): number {
        return this.filteredTickets.filter(ticket => ticket.Status === 'NEW').length;
      }

      InProgressCount(): number {
        return this.filteredTickets.filter(ticket => ticket.Status === 'IN PROGRESS').length;
      }

      ResolveCount(): number {
        return this.filteredTickets.filter(ticket => ticket.Status === 'RESOLVED').length;
      }

      ClosedTicketCount(): number {
        return this.filteredTickets.filter(ticket => ticket.Status === 'CLOSED').length;
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
      TicketID: this.selectedRow.TicketID,
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
          ticketID:this.selectedRow.TicketID || '',
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
        TicketID:this.selectedRow?.TicketID || '',
        ticketCategory: this.selectedRow?.CategoryName || '',
        Severity: '',
        IncidentType: '',
        ReportedBy: this.selectedRow?.ClientName || '',


      };
    }
  }
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.attachments = Array.from(files);
    }
  }

  onInitialFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.initialAttachments = Array.from(files);
    }
  }
  removeAttachment(index: number): void {
    if (this.isChatDisabled) return;
    this.attachments.splice(index, 1);
  }

loadMessages(ticketId: string): void {
  this.messages = this.chatService.getMessages(ticketId);
}


sendMessage(): void {
  if (!this.newMessage.trim() || !this.currentTicketId || this.isChatDisabled) return;

  const newMsg: Message = {
    messageId: Date.now(),
    sender: 'Technical Support',
    role: 'Admin',
    content: this.newMessage,
    time: new Date().toLocaleTimeString(),
    attachments: this.attachments.map(file => ({
      name: file.name,
      type: file.type.split('/')[0] || 'file',
      url: URL.createObjectURL(file) 
    })),
    type: 'text'
  };
 
  this.chatService.sendMessage(this.currentTicketId, newMsg);
  this.messages.push(newMsg);
  this.newMessage = '';
  this.attachments = [];
  this.scrollToBottom();
}

private scrollToBottom() {
  setTimeout(() => {
    const thread = document.querySelector('.conversation-thread');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, 100);
}

  }
