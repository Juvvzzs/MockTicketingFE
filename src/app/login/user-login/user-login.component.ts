import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/modules/ticketing/service/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-user-login',
    templateUrl: './user-login.component.html',
    styleUrls: ['./user-login.component.css'],
    imports: [FormsModule]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  isLoading = false;
  returnUrl: string = '/dashboard';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    const loggedIn = this.authService.isLoggedIn();
    console.log('[LoginComponent] isLoggedIn:', loggedIn);

    // If truly logged in, redirect away from login page
    if (loggedIn) {
      this.router.navigate([this.returnUrl]);
    } else {
      // Optionally clear auth state if token is invalid
      this.authService.logout(); // removes any stale tokens
    }
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter both username and password',
        confirmButtonText: 'Ok'
      });
      return;
    }

    this.isLoading = true;

    this.authService.login(this.username, this.password)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (result) => {
          if (result.success) {
            Swal.fire({
              icon: 'success',
              title: 'Login Successful!',
              text: 'Welcome!',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate([this.returnUrl]);
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Login Failed',
              text: result.message || 'Invalid username or password.',
              confirmButtonText: 'Try Again'
            });
          }
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Login Error',
            text: 'An unexpected error occurred during login.',
            confirmButtonText: 'Ok'
          });
          console.error('Login error:', error);
        }
      });
  }
}
