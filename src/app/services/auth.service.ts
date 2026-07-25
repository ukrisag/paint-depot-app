import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthService as ApiAuthService } from './openapi-client/api/auth.service';
import { LoginDto, RegisterDto, UserDto, LoginResponseDto } from './openapi-client/model/models';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserDto | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiAuthService: ApiAuthService) {}

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
      this.currentUserSubject.next(authResult.user);
    }
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
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
}
