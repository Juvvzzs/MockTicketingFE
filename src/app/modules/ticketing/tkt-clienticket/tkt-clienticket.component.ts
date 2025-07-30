import { Component, OnInit } from '@angular/core';
import { TktCategory } from '../models/tkt-category';
import { TktCategoryService } from '../service/tkt-category.service';
import { TktCreatedService } from '../service/tkt-created.service';
import { TktDemochatService } from '../service/tkt-demochat.service';

import Swal from 'sweetalert2';

import {  Ticket } from '../models/tkt-created';

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

 interface Attachment {
  name: string;
  type: string;
  size?: number;
  url?: string;
}

interface StatusOption {
  value: string;
  label: string;
  selected?: boolean;
}
interface Status {
  value: string;
} 

@Component({
  selector: 'app-tkt-clienticket',
  templateUrl: './tkt-clienticket.component.html',
  styleUrls: ['./tkt-clienticket.component.css']
})
export class TktClienticketComponent implements OnInit {
 
  private previousStatus: string = '';
  ticketForm = {
    subject: '',
    description: '',
    category: '',
    catId: '', 
    tktCategory: '',
    tktId: ''
  };

  categories: TktCategory[] = [];
  tickets: Ticket[] = [];

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
    client: {
      ClientID: 'EMP-0001',
      ClientName: 'Azaleah Lenihan',
      Role: 'Client'
    }
  };

  messages: Message[] = [];
  newMessage = '';
  initialAttachments: File[] = [];
  attachments: File[] = [];
  isChatDisabled = false;
  paginatedTickets: Ticket[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 7;

      filteredTickets: Ticket[] = [];
      selectedStatus: string = 'all';
      selectedDateRange: string = 'all';
      selectedCategory: string = 'all';

      totalPages: number = 0;
      startIndex: number = 0;
      endIndex: number = 0;

  
  statusOptions: StatusOption[] = [
    { value: 'new', label: 'New' },
    { value: 'paused', label: 'In Progress', selected: true },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  status: Status [] = [
    { value: 'NEW'},
    { value: 'IN PROGRESS'},
    { value: 'RESOLVED'},
    { value: 'CLOSED'}
  ];
  error: string | undefined;
  submitting: boolean | undefined;
  successMessage: string | undefined;

  constructor(
    private tktCategoryService: TktCategoryService,
    private tktCreatedService: TktCreatedService,
    private chatService: TktDemochatService 
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadTickets();
  }

  showModal = false;
  selectedTicket: any = null;

  showTicketModal = false;
  showMessageModal = false;
  currentTicketId: any = null;


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
    next: (data) => {
      console.log('Tickets from API:', data);
      this.tickets = data.map((ticket: any) => ({
        tktId: ticket.TicketID || '',
        subject: ticket.Subject || '',
        priority: ticket.Priority || 'low',
        status: ticket.Status || 'NEW',
        created: ticket.CreatedDT || new Date().toISOString(),
        updated: ticket.LastUpdatedDT || new Date().toISOString(),
        category: ticket.CategoryName || ticket.CategoryID || '',
        tktCategory: ticket.CategoryName || '',
        description: ticket.Description || '',
        client: {
          ClientID: ticket.ClientEIC || 'EMP-0001',
          ClientName: ticket.ClientName || 'Azaleah Lenihan',
          Role: 'Client'
        },
        statusClass: this.normalizeStatusClass(ticket.Status),
        priorityClass: ticket.Priority ? ticket.Priority.toLowerCase() : 'low'
      })).sort((a, b) => 
        new Date(b.created).getTime() - new Date(a.created).getTime()
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
                       ticket.status.toLowerCase() === this.selectedStatus.toLowerCase();
    // Category filter
    const categoryMatch = this.selectedCategory === 'all' || 
                         ticket.category === this.selectedCategory;
    // Date range filter
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

//send message add here
sendMessage(): void {
  if (!this.newMessage.trim() || !this.currentTicketId || this.isChatDisabled) { 
    alert('Please fill in all required fields');
    return;
  }

  // Create the new message object
  const newMsg: Message = {
    messageId: Date.now(),
    sender: 'Azaleah Lenihan',
    role: 'Client',
    content: this.newMessage,
    time: new Date().toLocaleTimeString(),
    attachments: this.attachments.map(file => ({
      name: file.name,
      type: file.type.split('/')[0] || 'file',
      url: URL.createObjectURL(file) 
    })),
    type: 'text'
  };

  
  this.messages = [...this.messages, newMsg]; 
  this.newMessage = '';
  this.attachments = [];
  this.scrollToBottom();

 
  this.chatService.sendMessage(this.currentTicketId, newMsg);
}

private scrollToBottom() {
  setTimeout(() => {
    const thread = document.querySelector('.conversation-thread');
    if (thread) {
      // Cast to HTMLElement to access offsetHeight
      const htmlElement = thread as HTMLElement;
      htmlElement.scrollTop = htmlElement.scrollHeight;
      
      // Force reflow if needed (now properly typed)
      void htmlElement.offsetHeight;
    }
  }, 0);
}

addStatusChangeMessage(ticketId: string, newStatus: string): void {
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

  // Add this method to handle category selection
onCategoryChange(event: any): void {
  const selectedCatId = event.target.value;
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

      const newTicket = {
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
          this.error = 'Failed to save ticket. Please try again.';
          console.error(error);
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

resetForm(): void {
  this.ticketForm = {
    subject: '',
    description: '',
    category: '',
    catId: '',
    tktCategory: '',
    tktId: ''
  };
  this.submitting = false;
}

onStatusChange(newStatus: string): void {
  if (!this.currentTicketId || !this.selectedTicket) return;

  // Store the current status before changing it
  this.previousStatus = this.selectedTicket.status;
  
  this.selectedTicket.status = newStatus;
  this.selectedTicket.updated = new Date().toLocaleString();
  this.isChatDisabled = ['CLOSED'].includes(newStatus);

  this.addStatusChangeMessage(this.currentTicketId, newStatus);


  this.updateTicketStatus(this.selectedTicket);
}
  
  //--------------------------------------------------------------//
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
  
  // Find first matching key
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

openTicket(ticketId: string) {
  this.selectedTicket = this.tickets.find(t => t.tktId === ticketId);
  this.currentTicketId = ticketId;
  this.loadMessages(ticketId);
  this.messages = this.chatService.getMessages(ticketId);
  this.newMessage = '';

  if (this.selectedTicket) {
    const statusClass = this.getStatusClass(this.selectedTicket.status);
    this.selectedTicket.statusClass = statusClass;
    this.isChatDisabled = ['CLOSED'].includes(this.selectedTicket.status || '');

    // Add initial status message if this is the first time opening
    if (this.messages.filter(m => m.isStatusChange).length === 0) {
      this.addStatusChangeMessage(ticketId, `Ticket opened with status: ${this.selectedTicket.status}`);
    }
  }

  this.showModal = true;
}
  viewTicket(ticketId: string) {
      this.currentTicketId = this.tickets.find(t => t.tktId === ticketId);
      
     
      if (this.currentTicketId) {
        const statusClass = this.getStatusClass(this.currentTicketId.status);
 
        this.currentTicketId.currentStatus = statusClass === 'paused' ? 'in-progress' : statusClass;
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

  removeAttachment(index: number): void {
    if (this.isChatDisabled) return;
    this.attachments.splice(index, 1);
  }
 loadMessages(ticketId: string): void {
  this.messages = this.chatService.getMessages(ticketId);
}


updateTicketStatus(ticket: any) {
  if (!ticket || !ticket.tktId) return;

  this.tktCreatedService.updateTicketStatus(ticket.tktId, ticket.status)
    .subscribe({
      next: (res) => {
        console.log('Status updated successfully!');
  
        this.addStatusChangeMessage(ticket.tktId, `Status confirmed as ${ticket.status}`);
      },
      error: (err) => {
        console.error('Error updating status:', err);

        this.selectedTicket.status = this.previousStatus;
        this.addStatusChangeMessage(ticket.tktId, 
          `Failed to update status to ${ticket.status}. Reverted to ${this.previousStatus}`);
      }
    });
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
   getTotalPages(): number {
    return Math.ceil(this.tickets.length / this.itemsPerPage);
    }

nextPage(): void {
  if (this.currentPage < this.getTotalPages()) {
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

getFirstItemOnPage(): number {
  return (this.currentPage - 1) * this.itemsPerPage + 1;
}

getLastItemOnPage(): number {
  const lastItem = this.currentPage * this.itemsPerPage;
  return lastItem > this.tickets.length ? this.tickets.length : lastItem;
}
}
