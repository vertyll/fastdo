import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly URL = environment.backendUrl;
  private readonly http = inject(HttpClient);

  login(dto: LoginDto): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(
      `${this.URL}/auth/login`,
      dto,
    );
  }

  register(dto: RegisterDto): Observable<any> {
    return this.http.post(`${this.URL}/auth/register`, dto);
  }
}
