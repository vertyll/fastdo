import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '../../shared/defs/entities.defs';
import { RoleApiService } from './role.api.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly apiService = inject(RoleApiService);

  readonly $roles = signal<Role[]>([]);
  readonly $loading = signal(false);

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
