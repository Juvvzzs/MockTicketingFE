import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IncidentReport } from '../models/tkt-details.model';
import { JsonBinResponse } from '../models/tkt-details.model';


@Injectable({
  providedIn: 'root'
})
export class TktCrtincReportService {

  private binId = '688a3c76ae596e708fbe54d3'; 
  private apiUrl = `https://api.jsonbin.io/v3/b/${this.binId}`;  //https://api.jsonbin.io/v3/b/

  constructor( private http: HttpClient) { }

  getIncidentReports(): Observable<IncidentReport[]> {
    return this.http.get<JsonBinResponse>(`${this.apiUrl}/latest`).pipe(
      map(res => (res.record?.incident_reports as unknown as IncidentReport[]) || []),
      catchError(this.handleError)
    );
  }
  SubmitIncidentReport(incidentReport: IncidentReport): Observable<any> {
  return this.getIncidentReports().pipe(
    switchMap((reports: IncidentReport[]) => {
      const updatedReports = [...reports, incidentReport];
      return this.http.put(this.apiUrl, { incident_reports: updatedReports });
    }),
    catchError(this.handleError)
  );
}   
  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}