import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginResponse, PasswordResetResponse, User } from '../models/user';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_DATA_KEY = 'user_data';

  private isAuthenticated = false;
  private currentUser: User | null = null;

  private mockUsers = [
    {
      id: 1,
      username: 'admin',
      password: '123456',
      email: 'admin@example.com',
      role: 'admin'
    }
  ];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    try {
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      const storedUser = localStorage.getItem(this.USER_DATA_KEY);

      if (storedToken && storedUser && this.validateToken(storedToken)) {
        this.currentUser = JSON.parse(storedUser);
        this.isAuthenticated = true;
      } else {
        this.clearAuthData();
      }
    } catch (error) {
      console.error('Failed to load user session:', error);
      this.clearAuthData();
    }
  }

  private validateToken(token: string): boolean {
    // Accept mock token format only during dev
    if (token.startsWith('mock-jwt-token-')) {
      return true;
    }

    // Real JWT token check (has 3 parts)
    const parts = token.split('.');
    return parts.length === 3;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const user = this.mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      const authUser: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      const mockToken = `mock-jwt-token-${Date.now()}`;
      this.saveAuthData(authUser, mockToken);

      return of({
        success: true,
        message: 'Login successful',
        user: authUser,
        token: mockToken
      }).pipe(delay(1000));
    } else {
      return of({
        success: false,
        message: 'Invalid username or password'
      }).pipe(delay(1000));
    }
  }

  private saveAuthData(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
    this.currentUser = user;
    this.isAuthenticated = true;
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  resetPassword(email: string): Observable<PasswordResetResponse> {
    const user = this.mockUsers.find(u => u.email === email);

    if (user) {
      return of({
        success: true,
        message: 'Password reset instructions have been sent to your email'
      }).pipe(delay(1000));
    } else {
      return of({
        success: false,
        message: 'Email not found'
      }).pipe(delay(1000));
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
  const token = this.getToken();

  const isValid = token !== null && this.validateToken(token);
  console.log('[AuthService] Token check:', token, '| isValid:', isValid);

  return isValid;
}


  getCurrentUser(): User | null {
    if (!this.isLoggedIn()) {
      return null;
    }

    try {
      return this.currentUser ?? JSON.parse(localStorage.getItem(this.USER_DATA_KEY) || 'null');
    } catch (error) {
      console.error('Error retrieving user data:', error);
      this.clearAuthData();
      return null;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`${operation}:`, error);

      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: `${operation}: ${error.error?.message || error.message || 'Unknown error occurred'}`,
        confirmButtonText: 'Ok'
      });

      return throwError(() => error);
    };
  }
}
