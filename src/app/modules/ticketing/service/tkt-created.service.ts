import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TktCreated } from '../models/tkt-created';

interface JsonBinResponse {
  record: {
    TicketsCreated: TktCreated[]; 
  };
}

@Injectable({
  providedIn: 'root'
})
export class TktCreatedService {
  
  private binId = '6875dce46063391d31addc8b';
  private apiUrl = `https://api.jsonbin.io/v3/b/${this.binId}`;

  constructor(private http: HttpClient) { }

  getTickets(): Observable<TktCreated[]> {
    return this.http.get<JsonBinResponse>(`${this.apiUrl}/latest`).pipe(
      map(res => {
        const tickets = res.record?.TicketsCreated || [];
        // Sort tickets by CreatedDT in descending order
        return tickets.sort((a, b) => 
          new Date(b.CreatedDT).getTime() - new Date(a.CreatedDT).getTime()
        );
      }),
      catchError(this.handleError)
    );
  }

  createTicket(newTicket: TktCreated): Observable<any> {
    return this.getTickets().pipe(
      switchMap((tickets: TktCreated[]) => {
        const updated = [...tickets, newTicket];
        return this.http.put(this.apiUrl, { TicketsCreated: updated });
      }),
      catchError(this.handleError)
    );
  }

  getTicketById(ticketId: string): Observable<TktCreated | undefined> {
    return this.getTickets().pipe(
      map(tickets => tickets.find(t => t.TicketID === ticketId))
    );
  }
  updateTicketStatus(tktId: string, newStatus: string): Observable<any> {
  return this.getTickets().pipe(
    switchMap((tickets: TktCreated[]) => {
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