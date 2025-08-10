import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TktCategory } from '../models/tkt-category';
import { TktCategoryService } from '../service/tkt-category.service';
import { TktCreatedService } from '../service/tkt-created.service';
import { TktDemochatService } from '../service/tkt-demochat.service';
import Swal from 'sweetalert2';
import { Ticket, TktCreated } from '../models/tkt-created';
import { Message, ClientInfo, StatusOption, TicketForm } from '../models/tkt-details.model';



@Component({
    selector: 'app-tkt-clienticket',
    templateUrl: './tkt-clienticket.component.html',
    styleUrls: ['./tkt-clienticket.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule]
})
export class TktClienticketComponent implements OnInit {
  private previousStatus = '';
  successMessage = '';
  error = '';
  loading = false;
  submitting = false;
  showModal = false;
  showTicketModal = false;
  showMessageModal = false;
  isChatDisabled = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  startIndex = 0;
  endIndex = 0;
  selectedStatus = 'all';
  selectedDateRange = 'all';
  selectedCategory = 'all';
  newMessage = '';
  currentTicketId: string | null = null;
  selectedTicket: Ticket | null = null;

  categories: Array<TktCategory> = [];
  tickets: Array<Ticket> = [];
  filteredTickets: Array<Ticket> = [];
  paginatedTickets: Array<Ticket> = [];
  messages: Array<Message> = [];
  initialAttachments: Array<File> = [];
  attachments: Array<File> = [];

  ticketForm: TicketForm = {
    subject: '',
    description: '',
    category: '',
    catId: '',
    tktCategory: '',
    tktId: '',
    status: 'NEW',
    priority: 'low'
  };

  client: ClientInfo = {
    ClientID: 'EMP-0001',
    ClientName: 'Azaleah Lenihan',
    Role: 'Client'
  };

  statusOptions: Array<StatusOption> = [
    { value: 'NEW', label: 'New' },
    { value: 'IN PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  ticket: Ticket = {
    tktId: '',
    subject: '',
    priority: 'low',
    status: 'NEW',
    created: new Date().toLocaleString(),
    updated: new Date().toLocaleString(),
    category: '',
    tktCategory: '',
    description: '',
    client: this.client
  };

  constructor(
    private tktCategoryService: TktCategoryService,
    private tktCreatedService: TktCreatedService,
    private chatService: TktDemochatService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadTickets();
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
    this.tktCreatedService.getTickets().subscribe({
      next: (data: TktCreated[]) => {
        console.log('Tickets from API:', data);
        this.tickets = data.map(ticket => ({
          tktId: ticket.TicketID || '',
          subject: ticket.Subject || '',
          priority: ticket.Priority || 'low',
          status: ticket.Status || 'NEW',
          created: ticket.CreatedDT || new Date().toISOString(),
          updated: ticket.LastUpdatedDT || new Date().toISOString(),
          category: ticket.CategoryName || ticket.CatId || '',
          tktCategory: ticket.CategoryName || '',
          description: ticket.Description || '',
          client: {
            ClientID: ticket.ClientEIC || 'EMP-0001',
            ClientName: ticket.ClientName || 'Azaleah Lenihan',
            Role: 'Client'
          },
          statusClass: this.normalizeStatusClass(ticket.Status),
          priorityClass: ticket.Priority?.toLowerCase() || 'low'
        })).sort((a, b) =>
          new Date(b.created).getTime() - new Date(a.created).getTime()
        );
        
        this.filteredTickets = [...this.tickets];
        this.updatePagination();
      },
      error: err => {
        console.error('Failed to load tickets', err);
        this.tickets = [];
        this.filteredTickets = [];
        this.updatePagination();
      }
    });
  }

  openCreateTicketModal(): void {
    this.showTicketModal = true;
  }

  openMessageModal(ticketId: string): void {
    this.currentTicketId = ticketId;
    this.messages = this.chatService.getMessages(ticketId);
    this.showMessageModal = true;
    this.isChatDisabled = ['CLOSED'].includes(
      this.tickets.find(t => t.tktId === ticketId)?.status || ''
    );
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.currentTicketId || this.isChatDisabled) {
      alert('Please fill in all required fields');
      return;
    }

    const newMsg: Message = {
      messageId: Date.now(),
      sender: this.client.ClientName,
      role: this.client.Role,
      content: this.newMessage,
      time: new Date().toLocaleTimeString(),
      attachments: this.attachments.map(file => ({
        name: file.name,
        type: file.type.split('/')[0] || 'file',
        url: URL.createObjectURL(file)
      })),
      type: 'text'
    };

    this.messages.push(newMsg);
    this.newMessage = '';
    this.attachments = [];
    this.scrollToBottom();

    this.chatService.sendMessage(this.currentTicketId, newMsg);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const thread = document.querySelector('.conversation-thread');
      if (thread) {
        const htmlElement = thread as HTMLElement;
        htmlElement.scrollTop = htmlElement.scrollHeight;
        void htmlElement.offsetHeight;
      }
    });
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

  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedCatId = select.value;
    const selectedCategory = this.categories.find(cat => cat.CatId === selectedCatId);
    
    if (selectedCategory) {
      this.ticketForm.category = selectedCategory.Category;
      this.ticketForm.catId = selectedCatId;
    }
  }

  createTicket(): void {
    if (!this.ticketForm.subject || !this.ticketForm.category || !this.ticketForm.description || !this.ticketForm.catId) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    this.tktCreatedService.getTickets().subscribe({
      next: (tickets) => {
        const maxIdNum = tickets.reduce((max, ticket) => {
          const match = ticket.TicketID.match(/^TKT-(\d{3})$/);
          const num = match ? parseInt(match[1], 10) : 0;
          return Math.max(max, num);
        }, 0);

        const nextIdNum = maxIdNum + 1;
        const paddedNum = nextIdNum.toString().padStart(3, '0');
        const nextId = `TKT-${paddedNum}`;

        const newTicket: TktCreated = {
          TicketID: nextId,
          ClientEIC: this.ticket.client.ClientID,
          ClientName: this.ticket.client.ClientName,
          CatId: this.ticketForm.catId,
          CategoryName: this.ticketForm.category,
          Subject: this.ticketForm.subject,
          Description: this.ticketForm.description,
          Status: 'NEW',
          CreatedDT: new Date().toISOString(),
          LastUpdatedDT: new Date().toISOString(),
          Priority: 'low'
        };

        this.tktCreatedService.createTicket(newTicket).subscribe({
          next: () => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Ticket created successfully!',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });

            this.successMessage = 'Ticket created successfully!';
            this.resetForm();
            this.showTicketModal = false;
            this.loadTickets();
            this.openMessageModal(nextId);
          },
          error: (error) => {
            this.submitting = false;
            this.error = 'Failed to save ticket.';
            console.error('Error creating ticket:', error);
          }
        });
      },
      error: (err) => {
        this.submitting = false;
        this.error = 'Failed to fetch existing tickets.';
        console.error('Error fetching tickets:', err);
      }
    });
  }

  resetForm(): void {
    this.ticketForm = {
      subject: '',
      description: '',
      category: '',
      catId: '',
      tktCategory: '',
      tktId: '',
      status: 'NEW',
      priority: 'low'
    };
    this.submitting = false;
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

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  updateTicketStatus(ticket: Ticket): void {
    if (!ticket?.tktId) return;

    this.tktCreatedService.updateTicketStatus(ticket.tktId, ticket.status).subscribe({
      next: () => {
        console.log('Status updated successfully!');
        this.addStatusChangeMessage(ticket.tktId, `Status confirmed as ${ticket.status}`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        if (this.selectedTicket) {
          this.selectedTicket.status = this.previousStatus;
          this.addStatusChangeMessage(ticket.tktId,
            `Failed to update status to ${ticket.status}. Reverted to ${this.previousStatus}`);
        }
      }
    });
  }

  applyFilters(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      const statusMatch = this.selectedStatus === 'all' ||
        ticket.status.toLowerCase() === this.selectedStatus.toLowerCase();
      
      const categoryMatch = this.selectedCategory === 'all' ||
        ticket.category === this.selectedCategory;
      
      let dateMatch = true;
      if (this.selectedDateRange !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const ticketDate = new Date(ticket.created);

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

  openTicket(ticketId: string): void {
    const ticket = this.tickets.find(t => t.tktId === ticketId);
    this.selectedTicket = ticket || null;
    this.currentTicketId = ticketId;
    this.loadMessages(ticketId);
    this.messages = this.chatService.getMessages(ticketId);
    this.newMessage = '';

    if (this.selectedTicket) {
      this.selectedTicket.statusClass = this.selectedTicket.status?.toLowerCase() || 'new';
      this.isChatDisabled = ['CLOSED'].includes(this.selectedTicket.status);

      if (!this.messages.some(m => m.isStatusChange)) {
        this.addStatusChangeMessage(ticketId, `Ticket opened with status: ${this.selectedTicket.status}`);
      }
    }

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTicket = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.attachments = Array.from(input.files);
    }
  }

  onInitialFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.initialAttachments = Array.from(input.files);
    }
  }

  removeAttachment(index: number): void {
    if (this.isChatDisabled) return;
    this.attachments.splice(index, 1);
  }

  loadMessages(ticketId: string): void {
    this.messages = this.chatService.getMessages(ticketId);
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

  NewOpenCount(): number {
    return this.filteredTickets.filter(ticket => ticket.status === 'NEW').length;
  }

  InProgressCount(): number {
    return this.filteredTickets.filter(ticket => ticket.status === 'IN PROGRESS').length;
  }

  ResolveCount(): number {
    return this.filteredTickets.filter(ticket => ticket.status === 'RESOLVED').length;
  }

  ClosedTicketCount(): number {
    return this.filteredTickets.filter(ticket => ticket.status === 'CLOSED').length;
  }

 
}
