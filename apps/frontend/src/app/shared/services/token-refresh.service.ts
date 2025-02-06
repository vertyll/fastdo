import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../auth/data-access/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private refreshTokenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public refreshToken(req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> {
    if (this.refreshTokenSubject.value) {
      return this.refreshTokenSubject.pipe(
        filter(isRefreshing => !isRefreshing),
        take(1),
        switchMap(() => next(this.addToken(req, this.authService.getAccessToken()!))),
      );
    }

    this.refreshTokenSubject.next(true);

    return this.authService.refreshToken().pipe(
      switchMap(token => {
        const newToken = token.data.accessToken;
        this.refreshTokenSubject.next(false);
        return next(this.addToken(req, newToken));
      }),
      catchError(error => {
        this.refreshTokenSubject.next(false);
        this.authService.logout();
        this.router.navigate(['/login']);
        return throwError(() => error);
      }),
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
