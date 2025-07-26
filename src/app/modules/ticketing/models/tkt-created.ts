export interface TktCreated {
TicketID: string;
  ClientEIC: string;
  ClientName: string;
  CatId: string;
  CategoryName: string;
  Subject: string;
  Description: string;
  Status: string;
  CreatedDT: string;
  LastUpdatedDT: string;
  Priority: string;
}
export interface Ticket {
  tktId: string;
  subject: string;
  priority: string;
  status: string;
  created: string;
  updated: string;
  category: string;
  tktCategory?: string;
  description?: string;
  client: {
    ClientID: string;
    ClientName: string;
    Role: string;
  };
  statusClass?: string;
  priorityClass?: string;
}
