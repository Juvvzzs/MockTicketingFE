import { Injectable } from '@angular/core';
import { TktAdminview } from '../models/tkt-adminview';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, switchMap, throwError } from 'rxjs';

interface JsonBinResponse{
  record: {
    TicketsCreated: TktAdminview[]; // Replace 'any' with the actual type if available
  };
}

@Injectable({
  providedIn: 'root'
})
export class TktAdminviewService {

  private binId = '6875dce46063391d31addc8b';
  private apiUrl = `https://api.jsonbin.io/v3/b/${this.binId}`;

  constructor(private http: HttpClient) { }

  getTickets(): Observable<TktAdminview[]> {
      return this.http.get<JsonBinResponse>(`${this.apiUrl}/latest`).pipe(
        map(res => {
          const tickets = res.record?.TicketsCreated || [];
          // Sort tickets by CreatedDT in descending order (newest first)
          return tickets.sort((a, b) => 
            new Date(b.CreatedDT).getTime() - new Date(a.CreatedDT).getTime()
          );
        }),
        catchError(this.handleError)
      );
    }
  
      getTicketById(ticketId: string): Observable<TktAdminview | undefined> {
        return this.getTickets().pipe(
          map(tickets => tickets.find(t => t.TicketID === ticketId))
        );
      }
      updateTicketStatus(tktId: string, newStatus: string): Observable<any> {
      return this.getTickets().pipe(
        switchMap((tickets: TktAdminview[]) => {
          const updatedTickets = tickets.map(ticket =>
            ticket.TicketID === tktId ? { ...ticket, Status: newStatus, updated: new Date().toISOString() } : ticket
          );
          return this.http.put(this.apiUrl, { TicketsCreated: updatedTickets });
        }),
        catchError(this.handleError)
      );
    }
private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
} 