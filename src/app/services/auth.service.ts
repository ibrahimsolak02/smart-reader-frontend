import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  RegisterRequest,
  VerifyRequest,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/v1/auth';
  private readonly TOKEN_KEY = 'jwt_token';

  constructor(private http: HttpClient) {}

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, request, { responseType: 'text' });
  }

  verify(request: VerifyRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/verify`, request, { responseType: 'text' });
  }

  login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.API_URL}/login`, request);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = token.split('.')[1];

      let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }

      const decodedPayload = JSON.parse(window.atob(base64));
      const expirationTime = decodedPayload.exp * 1000;
      const currentTime = Date.now();

      const isExpired = expirationTime < currentTime;

      if (isExpired) {
        this.logout();
      }

      return isExpired;
    } catch (e) {
      this.logout();
      return true;
    }
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  resendCode(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/resend-code`, { email }, { responseType: 'text' });
  }
}
