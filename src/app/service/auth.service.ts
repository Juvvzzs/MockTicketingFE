import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
 
  constructor(private http: HttpClient, private Router: Router) {
    
  }

  // sample edit
 
}
