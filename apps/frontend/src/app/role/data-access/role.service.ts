import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '../../shared/types/entities.type';
import { RoleApiService } from './role.api.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  readonly $roles = signal<Role[]>([]);
  readonly $loading = signal(false);

  constructor(private readonly apiService: RoleApiService) {}

  public getAllRoles(lang?: string): Observable<Role[]> {
    this.$loading.set(true);

    return new Observable(observer => {
      this.apiService.getAllRoles(lang).subscribe({
        next: response => {
          if (response.data) {
            this.$roles.set(response.data);
            observer.next(response.data);
          }
          this.$loading.set(false);
          observer.complete();
        },
        error: error => {
          this.$loading.set(false);
          observer.error(error);
        },
      });
    });
  }

  public getRoles(): Role[] {
    return this.$roles();
  }
}
