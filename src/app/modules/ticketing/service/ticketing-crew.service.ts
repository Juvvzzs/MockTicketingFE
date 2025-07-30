import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map, switchMap, Observable } from 'rxjs';
import { TicketingCrew } from '../models/user';


interface JsonBinResponse {
  record: {
    TicketCrew: TicketingCrew[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class TicketingCrewService {
  private binId = '6888e3697b4b8670d8a94010';
  private apiUrl = `https://api.jsonbin.io/v3/b/${this.binId}`;

  constructor(private http: HttpClient) { }

  getCrew(): Observable<TicketingCrew[]> {
    return this.http.get<JsonBinResponse>(`${this.apiUrl}/latest`).pipe(
      map(res => res.record?.TicketCrew || []),
      catchError(this.handleError) 
    );
  }

  saveCrew(newCrew: TicketingCrew): Observable<any> {
    return this.getCrew().pipe(
      switchMap((crew: TicketingCrew[]) => {
        const updated = [...crew, newCrew];
        return this.http.put(this.apiUrl, { TicketCrew: updated });
      }),
      catchError(this.handleError)
    );
  } 

  private handleError(error: any) {
      console.error('API Error:', error);
      return throwError(() => new Error(error.message || 'Server error'));
    }

}
