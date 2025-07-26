import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { JsonBinResponse } from '../models/tkt-details.model';
import { IncidentReport, IncidentList, JsonBinResponse2,} from '../models/tkt-details.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentserviceService {

  private binId = '687fc10fae596e708fb9ed7d'; 
  private apiUrl = `https://api.jsonbin.io/v3/b/${this.binId}`;  //https://api.jsonbin.io/v3/b/

  constructor( private http: HttpClient) { }


   getIncidentReports(): Observable<IncidentList[]> {
  return this.http.get<JsonBinResponse>(`${this.apiUrl}/latest`).pipe(
    tap(response => console.log('Raw API response:', response)),
    map(res => {
      const reports = res.record?.incident_reports || [];
       return [...reports].reverse();
    }),
    catchError(this.handleError)
  );
} 
 
   getIncidentById(reportId: string): Observable<IncidentReport | null> {
    return this.http.get<JsonBinResponse2>(`${this.apiUrl}/latest`).pipe(
    tap(response => console.log('Raw API Response:', response)), // Add this line
    map(res => {
        const reports = res.record?.incident_reports || [];
        const foundIncident = reports.find(incident => 
          incident.IncidentID === reportId || 
          incident.IncidentID === reportId
        );

        if (!foundIncident) return null;

        return this.mapIncidentData(foundIncident);
      }),
      catchError(this.handleError)
    );
  }

  private mapIncidentData(apiIncident: any): IncidentReport {
     console.log('Mapping incident:', apiIncident); 
    return {
      IncidentID: apiIncident.IncidentID,
      ticketCategory: apiIncident.TktID || apiIncident.ticketCategory,
      Severity: this.normalizeSeverity(apiIncident.Severity || apiIncident.severity),
      IncidentType: apiIncident.incidentType || apiIncident.IncidentType,
      ImpactAssessment: apiIncident.impactAssessment || apiIncident.ImpactAssessment || '',
      ContainmentActions: apiIncident.containmentActions || apiIncident.ContainmentActions || '',
      EradicationSteps: apiIncident.eradicationSteps || apiIncident.EradicationSteps || '',
      RecoveryProcess: apiIncident.recoveryProcess || apiIncident.RecoveryProcess || '',
      LessonsLearned: apiIncident.lessonsLearned || apiIncident.LessonsLearned || '',
      ReportedToAuthorities: apiIncident.reportedToAuthorities || apiIncident.ReportedToAuthorities || 'No',
      ReportDateTime: new Date(apiIncident.reportDateTime || apiIncident.ReportDateTime).toISOString(),
      ReportedBy: apiIncident.reportedBy || apiIncident.ReportedBy,
      Status: apiIncident.Status || apiIncident.TicketStatus,
      
    };
  }

  private normalizeSeverity(severity: string): 'Critical' | 'High' | 'Medium' | 'Low' {
    const normalized = severity?.toLowerCase();
    if (normalized?.includes('critical')) return 'Critical';
    if (normalized?.includes('high')) return 'High';
    if (normalized?.includes('medium')) return 'Medium';
    return 'Low'; // default
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}