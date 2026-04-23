import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { ProjectRolePermissionEnum } from 'src/app/shared/enums/project-role-permission.enum';
import { ProjectsService } from '../../project/data-access/project.service';

@Injectable({ providedIn: 'root' })
export class ProjectRolePermissionGuard implements CanActivate {
  private readonly projectsService = inject(ProjectsService);
  private readonly router = inject(Router);

  public canActivate(
    route: ActivatedRouteSnapshot & { data: { requiredPermission: ProjectRolePermissionEnum } },
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const projectId = route.params['id'];
    const requiredPermission = route.data.requiredPermission;
    return this.projectsService.getProjectByIdWithDetails(projectId).pipe(
      map(response => {
        const permissions = response.data?.permissions ?? [];
        const isPublic = response.data?.isPublic;
        if (
          permissions.includes(requiredPermission) ||
          (isPublic && requiredPermission === ProjectRolePermissionEnum.SHOW_TASKS)
        ) {
          return true;
        }
        return this.router.createUrlTree(['/projects']);
      }),
    );
  }
}
