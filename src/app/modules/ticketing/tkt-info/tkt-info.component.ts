import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IncidentserviceService } from '../service/incidents.service';
import { IncidentReport, TimelineEntry } from '../models/tkt-details.model'; 
import { faEdit, faTicketAlt, faFileExport, faPlus, faSpinner, faTrash, faClock, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tkt-info',
  templateUrl: './tkt-info.component.html',
  styleUrls: ['./tkt-info.component.css']
})
export class TktInfoComponent implements OnInit {
  incident: IncidentReport | null = null;
  loading = true;

  // FontAwesome icons
  faEdit = faEdit;
  faTicketAlt = faTicketAlt;
  faFileExport = faFileExport;
  faPlus = faPlus;
  faSpinner = faSpinner;
  faTrash = faTrash;
  faClock = faClock;
  faUser = faUser;

  // Modal states
  showEditDetailsModal = false;
  showAddTimelineModal = false;

  // Form data for editing
  editForm: any = {};
  timelineForm: TimelineEntry = {
    id: '',
    timestamp: '',
    description: '',
    author: '',
    recordedAt: ''
  };

  // Loading states
  savingDetails = false;
  savingTimeline = false;

  constructor(
    private route: ActivatedRoute,
    private incidentService: IncidentserviceService
  ) { }

  ngOnInit(): void {
    this.loadIncidentReportById();
  }

  // Getter to return sorted timeline entries (newest first)
  get sortedTimeline(): TimelineEntry[] {
    if (!this.incident?.timeline) return [];
    
    return [...this.incident.timeline].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });
  }

  loadIncidentReportById(): void {
  const id = this.route.snapshot.paramMap.get('id');
  console.log('Route ID:', id); // Check if ID exists
  
  if (!id) {
    console.error('No incident ID in route');
    this.loading = false;
    return;
  }

  this.incidentService.getIncidentById(id).subscribe({
    next: (incident) => {
      console.log('API Response:', incident); // Check the received data
      this.incident = incident;
      this.loading = false;
    },
    error: (err) => {
      console.error('Error loading incident:', err);
      this.loading = false;
    },
    complete: () => console.log('Request completed') // Verify completion
  });
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
    if (!status) return 'pill-low';
    const statusCleaned = status.toLowerCase().replace(/\d+\s*/, '');
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

  // Modal functions
  openEditDetailsModal(): void {
    if (this.incident) {
      this.editForm = {
        ImpactAssessment: this.incident.ImpactAssessment || '',
        ContainmentActions: this.incident.ContainmentActions || '',
        EradicationSteps: this.incident.EradicationSteps || '',
        RecoveryProcess: this.incident.RecoveryProcess || '',
        LessonsLearned: this.incident.LessonsLearned || ''
      };
      this.showEditDetailsModal = true;
    }
  }

  closeEditDetailsModal(): void {
    this.showEditDetailsModal = false;
    this.editForm = {};
  }

  saveIncidentDetails(): void {
    if (!this.incident) return;

    this.savingDetails = true;
    
    const updatedIncident = {
      ...this.incident,
      ...this.editForm,
      LastUpdatedDT: new Date().toISOString()
    };

    this.incidentService.updateIncident(this.incident.IncidentID, updatedIncident).subscribe({
      next: (response: IncidentReport) => {
        this.incident = response;
        this.closeEditDetailsModal();
        this.savingDetails = false;
        // Could add success toast notification here
      },
      error: (err: any) => {
        console.error('Error updating incident:', err);
        this.savingDetails = false;
        // Could add error toast notification here
      }
    });
  }

  openAddTimelineModal(): void {
    this.timelineForm = {
      id: '',
      timestamp: new Date().toISOString().slice(0, 16), // Format for datetime-local input
      description: '',
      author: 'Current User', // Should be replaced with actual user
      recordedAt: new Date().toISOString()
    };
    this.showAddTimelineModal = true;
  }

  closeAddTimelineModal(): void {
    this.showAddTimelineModal = false;
    this.timelineForm = {
      id: '',
      timestamp: '',
      description: '',
      author: '',
      recordedAt: ''
    };
  }

  saveTimelineEntry(): void {
    if (!this.incident || !this.timelineForm.description.trim()) return;

    this.savingTimeline = true;

    const timelineEntry = {
      ...this.timelineForm,
      id: Date.now().toString(), // Simple ID generation
      incidentId: this.incident.IncidentID
    };

    this.incidentService.addTimelineEntry(this.incident.IncidentID, timelineEntry).subscribe({
      next: (response: any) => {
        // Refresh incident data to get updated timeline
        this.loadIncidentReportById();
        this.closeAddTimelineModal();
        this.savingTimeline = false;
        // Could add success toast notification here
      },
      error: (err: any) => {
        console.error('Error adding timeline entry:', err);
        this.savingTimeline = false;
        // Could add error toast notification here
      }
    });
  }

  deleteTimelineEntry(entryId: string): void {
    if (!this.incident || !confirm('Are you sure you want to delete this timeline entry?')) return;

    // Optimistically update the UI immediately
    const originalTimeline = this.incident.timeline ? [...this.incident.timeline] : [];
    if (this.incident.timeline) {
      this.incident.timeline = this.incident.timeline.filter(entry => entry.id !== entryId);
    }

    this.incidentService.deleteTimelineEntry(this.incident.IncidentID, entryId).subscribe({
      next: (response: any) => {
        // Success - UI is already updated
        console.log('Timeline entry deleted successfully');
        // Could add success toast notification here
      },
      error: (err: any) => {
        console.error('Error deleting timeline entry:', err);
        // Rollback the UI change on error
        if (this.incident) {
          this.incident.timeline = originalTimeline;
        }
        // Could add error toast notification here
      }
    });
  }
}