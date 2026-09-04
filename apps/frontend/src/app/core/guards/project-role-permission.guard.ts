import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { ProjectsService } from '../../project/data-access/project.service';

@Injectable({ providedIn: 'root' })
export class ProjectRolePermissionGuard implements CanActivate {
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);

  public canActivate(
    route: ActivatedRouteSnapshot & { data: { requiredPermission: string } },
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const projectId = route.params['id'];
    const requiredPermission = route.data.requiredPermission;
    const deny = (): UrlTree => this.router.createUrlTree(['/projects']);

    return this.projectsService.getProjectByIdWithDetails(projectId).pipe(
      map(project => (project.permissions.includes(requiredPermission) ? true : deny())),
      catchError(() => of(deny())),
    );
  }
}
