import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { api } from '../connection';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly APIUrl_login = 'https://davnorsystems.gov.ph/hrisAPI/api/Auth';
  readonly APIUrl_HRIS = api + '/auth/login';

  private userPayload: any;
  constructor(private http: HttpClient, private Router: Router) {
    this.userPayload = this.decodedToken();
  }

  login(login: any = {}): Observable<any> {
    return this.http.post<any[]>(this.APIUrl_login + '/Login', login);
  }

  loginHRIS(eic: string): Observable<any> {
    return this.http.post<any[]>(this.APIUrl_HRIS + `/${eic}`, {});
  }

  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue);
  }

  storeDetails(data: any = {}) {
    localStorage.setItem('fullName', data.fullNameFirst);
    localStorage.setItem('officeName', data.officeNameShort);
    localStorage.setItem('divisionName', data.divisionName);
    localStorage.setItem('officeNameLong', data.officeName);
    localStorage.setItem('positionTitle', data.positionTitle);
    localStorage.setItem('userId', data.eic);
    localStorage.setItem('expire', data.expire);
    localStorage.setItem('sex', data.sex);
    localStorage.setItem('firstName', data.firstName);
    localStorage.setItem('officeRoleId', data.officeRoleId);
    localStorage.setItem('groupRoleId', data.groupRoleId);
  }

  decodedToken() {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken()!;
    return jwtHelper.decodeToken(token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLogin(): boolean {
    // const datenow = new Date();
    // var get_expire_token = localStorage.getItem('expire')?.toLowerCase();
    // const expire_token = new Date(get_expire_token!);

    // return !!localStorage.getItem('token') && expire_token >= datenow;
    return !!localStorage.getItem('token');
  }

  signout() {
    localStorage.clear();
    location.reload();
    this.Router.navigate(['login']);
  }

  expiredToken() {
    localStorage.clear();
    this.Router.navigate(['login']);
  }

  getOfficeIdFromToken() {
    if (this.userPayload) {
      return this.userPayload.officeId;
    }
  }

  getDivisionIdFromToken() {
    if (this.userPayload) {
      return this.userPayload.divisionId;
    }
  }
}
