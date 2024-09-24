import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Login } from '../models/Login';
import { Register } from '../models/Register';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly URL = environment.backendUrl;
  private readonly http = inject(HttpClient);

  login(dto: Login): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(
      `${this.URL}/auth/login`,
      dto,
    );
  }

  register(dto: Register): Observable<any> {
    return this.http.post(`${this.URL}/auth/register`, dto);
  }
}
