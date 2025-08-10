import { Injectable } from '@angular/core';

interface Message {
  messageId: number;
  sender: string;
  role: string;
  content: string;
  time: string;
  attachments: { name: string; type: string; url?: string }[];
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class TktDemochatService {
  private chatStorageKey = 'tkt-demo-chat-messages';

  getAllMessages(): { [ticketId: string]: Message[] } {
    const raw = localStorage.getItem(this.chatStorageKey);
    return raw ? JSON.parse(raw) : {};
  }

   getMessages(ticketId: string): Message[] {
    const key = `chat_${ticketId}`;
    const messages = localStorage.getItem(key);
    return messages ? JSON.parse(messages) : [];
  }

  sendMessage(ticketId: string, message: Message): void {
    const key = `chat_${ticketId}`;
    const existingMessages = this.getMessages(ticketId);
    existingMessages.push(message);
    localStorage.setItem(key, JSON.stringify(existingMessages));
  }
}

