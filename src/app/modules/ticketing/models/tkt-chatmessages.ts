export interface TktChatmessages {
  chatId: number;
  tktId: string;
  sender: string;
  role: string; // 'Client' or 'Technical Support'
  content: string;
  time: string;
  type: string; // 'system', 'user', 'support'
  attachments?: {
    name: string;
    type: string;
    url?: string;
  }[];
  timestamp: number;
}

export interface Attachment {
  name: string;
  type: string;
  size?: number;
  url?: string;
}


export interface ChatMessage {
  ChatId: number;
  tktId: string;
  clientId: string;
  reciverId: string;
  timestamp: number;
}