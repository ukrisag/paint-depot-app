import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService as ApiAuthService } from './openapi-client/api/auth.service';
import { LoginDto, RegisterDto, UserDto, LoginResponseDto, RefreshTokenRequestDto, ForgotPasswordDto, ResetPasswordDto } from './openapi-client/model/models';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRES_AT_KEY = 'token_expires_at';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserDto | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  private refreshTokenTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private apiAuthService: ApiAuthService,
    private router: Router
  ) {
    this.startTokenExpirationCheck();
  }

  get currentUserValue(): UserDto | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  get isAdmin(): boolean {
    const user = this.currentUserValue;
    // Check for both 'Admin', 'admin', and 'super_admin' roles
    const role = user?.role?.toLowerCase();
    return role === 'admin' || role === 'super_admin';
  }

  login(credentials: LoginDto): Observable<LoginResponseDto> {
    return this.apiAuthService.apiAuthLoginPost(credentials).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
          return response.data;
        }
        throw new Error(response.message || 'Login failed');
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterDto): Observable<UserDto> {
    return this.apiAuthService.apiAuthRegisterPost(userData).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Registration failed');
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearSession();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setSession(authResult: LoginResponseDto): void {
    if (authResult.token && authResult.user) {
      localStorage.setItem(TOKEN_KEY, authResult.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authResult.user));

      if (authResult.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, authResult.refreshToken);
      }

      if (authResult.expiresAt) {
        localStorage.setItem(TOKEN_EXPIRES_AT_KEY, authResult.expiresAt);
      }

      this.currentUserSubject.next(authResult.user);
      this.startRefreshTokenTimer();
    }
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    this.currentUserSubject.next(null);
    this.stopRefreshTokenTimer();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  refreshToken(): Observable<LoginResponseDto> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequestDto = { refreshToken };
    return this.apiAuthService.apiAuthRefreshTokenPost(request).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
          return response.data;
        }
        throw new Error(response.message || 'Token refresh failed');
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private startRefreshTokenTimer(): void {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    if (!expiresAt) return;

    const expires = new Date(expiresAt);
    const timeout = expires.getTime() - Date.now() - (60 * 1000); // Refresh 1 minute before expiry

    if (timeout > 0) {
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe();
      }, timeout);
    }
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  private startTokenExpirationCheck(): void {
    // Check every minute if token is expired
    setInterval(() => {
      const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
      if (expiresAt) {
        const expires = new Date(expiresAt);
        if (Date.now() >= expires.getTime()) {
          console.log('Token expired, attempting to refresh...');
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            this.refreshToken().subscribe({
              error: () => {
                console.log('Token refresh failed, logging out...');
                this.logout();
                this.router.navigate(['/login']);
              }
            });
          } else {
            this.logout();
            this.router.navigate(['/login']);
          }
        }
      }
    }, 60000); // Check every minute
  }

  private getUserFromStorage(): UserDto | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  forgotPassword(email: string): Observable<any> {
    const request: ForgotPasswordDto = { email };
    return this.apiAuthService.apiAuthForgotPasswordPost(request).pipe(
      map(response => {
        if (response.success) {
          return response;
        }
        throw new Error(response.message || 'Forgot password failed');
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    const request: ResetPasswordDto = { email, token, newPassword };
    return this.apiAuthService.apiAuthResetPasswordPost(request).pipe(
      map(response => {
        if (response.success) {
          return response;
        }
        throw new Error(response.message || 'Reset password failed');
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}
