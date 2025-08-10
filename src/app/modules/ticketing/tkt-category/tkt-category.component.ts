import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TktCategoryService } from '../service/tkt-category.service';
import { TktCategory } from '../models/tkt-category'; 
import Swal from 'sweetalert2';

declare var bootstrap: any; 

@Component({
  selector: 'app-tkt-category',
  templateUrl: './tkt-category.component.html',
  styleUrls: ['./tkt-category.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  providers: [DatePipe]
})
export class TktCategoryComponent implements OnInit {

  @ViewChild('addCategoryModal', { static: false }) addCategoryModal!: ElementRef;

  sortBy = '';
  successMessage = '';
  successDeleteMessage = '';
  isModalVisible = false;

  tickets: TktCategory[] = [];
  filteredTickets: TktCategory[] = [];
  hiddenTickets: string[] = [];

  currentDate: string;

  newCategory: TktCategory = {
  CatId: '',
  Category: '',
  Status: 'Enabled'
};


  loading = false;
  error = '';
  submitting = false;

  constructor(
    private datePipe: DatePipe,
    private ticketCategoryService: TktCategoryService
  ) {
    const today = new Date();
    this.currentDate = this.datePipe.transform(today, 'fullDate')!;
  }

  ngOnInit(): void {
    this.getTicketCategory();
  }

  getTicketCategory() {
    this.ticketCategoryService.getTicketCategory().subscribe({
      next: (categories) => {
        this.tickets = categories;
        this.filteredTickets = this.tickets.filter(ticket => !this.hiddenTickets.includes(ticket.CatId));
      },
      error: (err) => {
        console.error('Error fetching ticket categories:', err);
        this.error = 'Failed to load ticket categories.';
      }
    });
  }

  filterTickets(): void {
    if (!this.sortBy) {
      this.filteredTickets = this.tickets;
    } else {
      this.filteredTickets = this.tickets.filter(ticket => ticket.Status === this.sortBy);
    }
  }

onSubmit() {
  if (!this.newCategory.Category ) {
    this.error = 'Please fill in all required fields.';
    return;
  }

  this.submitting = true;
  this.error = '';

  this.ticketCategoryService.getTicketCategory().subscribe({
    next: (categories) => {
      const maxIdNum = categories.reduce((max, cat) => {
        const match = cat.CatId.match(/^CAT(\d{2})$/);
        const num = match ? parseInt(match[1], 10) : 0;
        return Math.max(max, num);
      }, 0);

      const nextIdNum = maxIdNum + 1;
      const paddedNum = nextIdNum.toString().padStart(2, '0');
      const nextId = `CAT${paddedNum}`;

      const payload: TktCategory = {
        CatId: nextId,
        Category: this.newCategory.Category,
        Status: this.newCategory.Status
      };

              this.ticketCategoryService.saveCategory(payload).subscribe({
          next: () => {
            this.getTicketCategory();
            this.newCategory = { CatId: '', Category: '', Status: undefined };
            this.submitting = false;

   
            const modalInstance = bootstrap.Modal.getInstance(this.addCategoryModal.nativeElement);
            if (modalInstance) {
              modalInstance.hide();
            }

            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Category has been added successfully.',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.submitting = false;
            this.error = 'Failed to save category. Please try again.';
            console.error(error);
          }
        });
    },
    error: (err) => {
      this.submitting = false;
      this.error = 'Failed to fetch existing categories.';
      console.error(err);
    }
  });
}

  updateTicketStatus(newStatus: 'Enabled' | 'Disabled'): void {
    const updates = this.tickets
      .filter(ticket => ticket.selected && ticket.Status !== newStatus)
      .map(ticket => {
        ticket.Status = newStatus;
        ticket.selected = false;

        return this.ticketCategoryService.updateCategoryStatus(ticket.CatId, {
          Category: ticket.Category,
          Status: newStatus
        });
      });

    if (updates.length > 0) {
      Promise.all(updates.map(obs => obs.toPromise()))
        .then(() => {
          this.successMessage = 'Statuses updated successfully!';
          setTimeout(() => this.successMessage = '', 2000);
          this.getTicketCategory();
        })
        .catch(error => {
          this.error = 'Failed to update one or more statuses.';
          console.error(error);
        });
    }
  }

  get isAnyTicketSelected(): boolean {
    return this.tickets.some(ticket => ticket.selected);
  }

  toggleSelection(ticket: any): void {
    ticket.selected = !ticket.selected;
  }

  confirmDelete(): void {
  const selectedIds = this.tickets
    .filter(ticket => ticket.selected)
    .map(ticket => ticket.CatId);

  if (selectedIds.length === 0) return;

  this.ticketCategoryService.getTicketCategory().subscribe({
    next: (data: any) => {
      const records = data.record?.TicketCategory || [];

      // Filter out the selected tickets
      const updatedRecords = records.filter((ticket: any) => !selectedIds.includes(ticket.id));

      // Update the bin with the new data
      this.ticketCategoryService.overwriteAllCategories(updatedRecords).subscribe({
        next: () => {
          this.successDeleteMessage = 'Item(s) deleted successfully.';
          this.getTicketCategory(); // Refresh list
          setTimeout(() => {
            this.successDeleteMessage = '';
            this.isModalVisible = false;
          }, 2000);
        },
        error: (err) => {
          this.error = 'Failed to delete items.';
          console.error(err);
        }
      });
    },
    error: (err) => {
      this.error = 'Failed to fetch current data.';
      console.error(err);
    }
  });
}

}

//category id walaon tas pulihan desrciption duha ray i send

