import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginModel } from '../models/login.model';
import { RegisterModel } from '../models/register.model';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly URL = environment.backendUrl;
  private readonly http = inject(HttpClient);

  login(dto: LoginModel): Observable<{ access_token: string }> {
    return this.http
      .post<{ access_token: string }>(`${this.URL}/auth/login`, dto)
      .pipe(catchError(this.handleError));
  }

  register(dto: RegisterModel): Observable<any> {
    return this.http
      .post(`${this.URL}/auth/register`, dto)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(
      () => new Error('Something bad happened; please try again later.'),
    );
  }
}
