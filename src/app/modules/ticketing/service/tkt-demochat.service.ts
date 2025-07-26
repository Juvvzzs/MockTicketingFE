import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators'; 
import { TktChatmessages } from '../models/tkt-chatmessages';
@Injectable({
  providedIn: 'root'
})
export class TktDemochatService {

 private messagesKey = 'chatMessages';
  private ticketsKey = 'chatTickets';

  // Message methods
  getMessages(ticketId: string): TktChatmessages[] {
    const all = JSON.parse(localStorage.getItem(this.messagesKey) || '{}');
    return all[ticketId] || [];
  }

  // In demochat.service.ts
sendMessage(ticketId: string, message: TktChatmessages): void {
  const all = JSON.parse(localStorage.getItem(this.messagesKey) || '{}');
  if (!all[ticketId]) all[ticketId] = [];
  
  // Check for duplicates before adding
  const exists = all[ticketId].some((m: TktChatmessages) => 
    m.timestamp === message.timestamp
  );
  
  if (!exists) {
    all[ticketId].push(message);
    localStorage.setItem(this.messagesKey, JSON.stringify(all));
  }
}

  // Ticket methods
  createTicket(ticket: any): void {
    const allTickets = JSON.parse(localStorage.getItem(this.ticketsKey) || '{}');
    allTickets[ticket.id] = ticket;
    localStorage.setItem(this.ticketsKey, JSON.stringify(allTickets));
  }

  getTicket(ticketId: string): any {
    const allTickets = JSON.parse(localStorage.getItem(this.ticketsKey) || '{}');
    return allTickets[ticketId];
  }

  getAllTickets(): any[] {
    const allTickets = JSON.parse(localStorage.getItem(this.ticketsKey) || '{}');
    return Object.values(allTickets);
  }

  updateTicket(ticket: any): void {
    const allTickets = JSON.parse(localStorage.getItem(this.ticketsKey) || '{}');
    allTickets[ticket.id] = ticket;
    localStorage.setItem(this.ticketsKey, JSON.stringify(allTickets));
  }
   
getNewMessages(ticketId: string, lastTimestamp: number): TktChatmessages[] {
  const all = JSON.parse(localStorage.getItem(this.messagesKey) || '{}');
  const ticketMessages = all[ticketId] || [];
  return ticketMessages.filter((msg: TktChatmessages) => msg.timestamp > lastTimestamp);
}
}
