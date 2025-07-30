import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TktCategory } from '../models/tkt-category';
import { TicketingCrew } from '../models/user';
import { TicketingCrewService } from '../service/ticketing-crew.service';
import { TktCategoryService } from '../service/tkt-category.service';
import Swal from 'sweetalert2';

declare var bootstrap: any; 

@Component({
  selector: 'app-tkt-crew',
  templateUrl: './tkt-crew.component.html',
  styleUrls: ['./tkt-crew.component.css']
})
export class TktCrewComponent implements OnInit {

  @ViewChild('addCrewModal', { static: false }) addCrewModal!: ElementRef;
  
   ticketcrew = {
    emp_id: '',
    assigned_category: '',
    emp_status: 'Offline',
    fullname: ''
  
   };

 ticketcategory = {
  catId: '',
  category: ''
 };
 newCrew: TicketingCrew = {
    Emp_id: '',
    fullname: '',
    category_assigned: '',
    emp_status: 'Offline'
  };
    loading = false;
    error = ''
    submitting = false;

  ticketingCrew: TicketingCrew[] = [];
  tickets: TktCategory[] = [];
  filteredTickets: TktCategory[] = [];
  categories: TktCategory[] = [];
  public profilePicture: any = {};

  constructor(private tktCategoryService: TktCategoryService,private TicketingCrew: TicketingCrewService) { }
  ngOnInit(): void {
    this.loadCategories();
     this.loadCrew();
  }

    loadCrew(): void {
      this.TicketingCrew.getCrew().subscribe(
        (data) => {
          console.log('Crew response:', data); // Add this!
          this.ticketingCrew = data || [];
        },
        (error) => {
          console.error('Error loading crew data:', error);
        }
      );
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
onCategoryChange(event: any): void {
  const selectedCatId = event.target.value;
  const selectedCategory = this.categories.find(cat => cat.CatId === selectedCatId);
  if (selectedCategory) {
    this.ticketcategory.category = selectedCategory.Category;
    this.ticketcategory.catId = selectedCatId;
  }
}

 onSubmit() {
    if (!this.newCrew.fullname  || !this.newCrew.category_assigned ){
      this.error = 'Please fill in all required fields.';
      return;
    }
    this.submitting = true;
    this.error = '';
  
    this.TicketingCrew.getCrew().subscribe({
      next: (ticketingcrew) => {
        const maxIdNum = ticketingcrew.reduce((max, emp_id) => {
          const match = emp_id.Emp_id.match(/^EMP(\d{2})$/);
          const num = match ? parseInt(match[1], 10) : 0;
          return Math.max(max, num);
        }, 0);
  
        const nextIdNum = maxIdNum + 1;
        const paddedNum = nextIdNum.toString().padStart(2, '0');
        const nextId = `EMP-${paddedNum}`;
  
        const payload: TicketingCrew = {
          Emp_id: nextId,
          fullname: this.newCrew.fullname,
          category_assigned: this.newCrew.category_assigned,
          emp_status: this.newCrew.emp_status
        };
  
                this.TicketingCrew.saveCrew(payload).subscribe({
            next: () => {
              this.loadCrew();
              this.newCrew = { Emp_id: '', fullname: '', emp_status: '', category_assigned: ''  };
              this.submitting = false;
  
     
              const modalInstance = bootstrap.Modal.getInstance(this.addCrewModal.nativeElement );
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
                 this.loadCrew();
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
        this.error = 'Failed to fetch existing CREWS.';
        console.error(err);
      }
    });
  }
}
