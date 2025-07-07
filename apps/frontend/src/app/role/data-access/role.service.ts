import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { SimpleRole } from 'src/app/shared/types/simple-entities.type';
import { RoleApiService } from './role.api.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  readonly $roles = signal<SimpleRole[]>([]);
  readonly $loading = signal(false);

  constructor(private readonly apiService: RoleApiService) {}

  public getAllRoles(lang?: string): Observable<SimpleRole[]> {
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

  public getRoles(): SimpleRole[] {
    return this.$roles();
  }
}
