export interface TktDetailsModel {
}

export interface Ticket {
  TicketID: string;
  ClientName: string;
  CategoryID: string;
  CategoryName: string;
  Subject: string;
  Status: string;
  CreatedDT: string;
  LastUpdatedDT: string;
  statusClass?: string;
  selected?: any;
}

export interface IncidentReport {
  IncidentID: string; 
  ticketCategory : string //ticket id ni dapat dre
  Severity : 'Critical' | 'High' | 'Medium' | 'Low';// 'Critical', 'High', 'Medium', 'Low'
  IncidentType: string, // 'Malware', 'Phishing', 'DDoS', 'Data Breach', etc.
  ImpactAssessment :string
  ContainmentActions :string
  EradicationSteps : string;
  RecoveryProcess : string;
  LessonsLearned: string;
  ReportedToAuthorities : boolean;
  ReportDateTime: string
  ReportedBy: string;
  Status: string
  timeline?: TimelineEntry[];
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  description: string;
  author: string;
  recordedAt: string;
}

export interface Message {
  messageId: number;
  sender: string;
  role: string;
  content: string;
  time: string;
  attachments: { name: string; type: string; url?: string }[];
  type: string;
}

export interface StatusOption {
  value: string;
  label: string;
  selected?: boolean;
}

export interface JsonBinResponse {
  record: {
    incident_reports: IncidentList[];  
};
}
export interface JsonBinResponse2 {
  record: {
    incident_reports: IncidentReport[];
  };
}


export interface IncidentList {
  IncID: string;
  TktID: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low'; // 'Critical', 'High', 'Medium', 'Low'
  incidentType: string; // 'Malware', 'Phishing', 'DDoS ', 'Data Breach', etc.
  impactAssessment: string; 
  containmentActions: string;
  eradicationSteps: string; 
  recoveryProcess: string;
  lessonsLearned: string;
  reportedToAuthorities: string; // 'Yes', 'No'
  reportDateTime: Date; // Date object
  reportedBy: string; // EIC of the user who reported the incident
  status:  string; // '1 New', '2 In Progress', '3 Resolved', etc.
  ReportDateTime?: Date; // Date object for the report date and time
  IncidentType?: string; // 'General' or specific type if available
  
}

export interface IncidentTimeline {
    TimelineID: string;
    EventTime: string;
    EventDescription: string;
    RecordedBy: string;
    RecordedDT: string;
}
  
export interface IncidentDetail extends IncidentList {
    timeline: IncidentTimeline[];
}