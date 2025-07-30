export interface TktAdminview {
    TicketID: string;
    ClientEIC: string;
    ClientName:string;
    CatID: string;
    CategoryName: string;
    Subject: string;
    Description: string;
    Status: string;
    CreatedDT: string;
    LastUpdatedDT: string;
    Priority: string;
    statusClass?: string;
    priorityClass?: string;
}
