import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  RegisterRequest,
  VerifyRequest,
  ResendCodeRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  constructor(private http: HttpClient) {}

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, request, { responseType: 'text' });
  }

  verify(request: VerifyRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/verify`, request, { responseType: 'text' });
  }

  login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`${this.API_URL}/login`, request)
      .pipe(tap((res) => this.saveTokens(res)));
  }

  saveTokens(response: AuthenticationResponse): void {
    const access = response.accessToken || response.token;
    if (access) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
    }
    if (response.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    }
  }

  saveToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  refreshToken(): Observable<AuthenticationResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearStorage();
      return of({} as AuthenticationResponse);
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.http
      .post<AuthenticationResponse>(`${this.API_URL}/refresh-token`, request)
      .pipe(tap((res) => this.saveTokens(res)));
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http
        .post(`${this.API_URL}/logout`, {})
        .pipe(catchError(() => of(null)))
        .subscribe(() => {
          this.clearStorage();
          window.location.href = '/login';
        });
    } else {
      this.clearStorage();
      window.location.href = '/login';
    }
  }

  clearStorage(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
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
      return expirationTime < Date.now();
    } catch {
      return true;
    }
  }

  resendCode(request: ResendCodeRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/resend-code`, request, { responseType: 'text' });
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, request);
  }

  getErrorMessage(err: any, defaultMessage: string = 'Bir hata oluştu.'): string {
    if (!err?.error) return err?.message || defaultMessage;
    if (typeof err.error === 'object' && err.error.message) return err.error.message;
    if (typeof err.error === 'string') {
      try {
        const parsed = JSON.parse(err.error);
        if (parsed?.message) return parsed.message;
      } catch {
        return err.error;
      }
    }
    return defaultMessage;
  }

  isRateLimitError(err: any): boolean {
    return err?.status === 429;
  }

  isAccountLockedError(err: any): boolean {
    return err?.status === 423;
  }

  getRetryAfterSeconds(err: any, defaultSeconds: number = 60): number {
    const retryHeader = err?.headers?.get('Retry-After');
    if (retryHeader) {
      const parsed = parseInt(retryHeader, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return defaultSeconds;
  }
}
