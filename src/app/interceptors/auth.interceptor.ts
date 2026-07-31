import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired, try to refresh
        const refreshToken = authService.getRefreshToken();
        if (refreshToken && !req.url.includes('/refresh-token')) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Retry the request with new token
              const newToken = authService.getToken();
              if (newToken) {
                req = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
              }
              return next(req);
            }),
            catchError(refreshError => {
              // Refresh failed, logout
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        } else {
          // No refresh token or refresh endpoint failed, logout
          authService.logout();
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
