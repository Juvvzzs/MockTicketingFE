export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
} 

export interface TicketingCrew {
  Emp_id: string;
  fullname: string;
  category_assigned: string;
  emp_status: string;
}