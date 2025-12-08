import { Directive, OnInit, TemplateRef, ViewContainerRef, inject, input } from '@angular/core';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { RoleEnum } from 'src/app/shared/enums/role.enum';

@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective implements OnInit {
  readonly allowedRoles = input.required<RoleEnum[] | RoleEnum>({ alias: 'appHasRole' });
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);
  private isVisible: boolean = false;

  ngOnInit(): void {
    const userRoles = this.authService.userRoles();
    if (!userRoles) {
      this.viewContainer.clear();
    } else {
      const allowedRoles = this.allowedRoles();
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const hasRole = roles.some(role => userRoles.includes(role));
      if (hasRole && !this.isVisible) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isVisible = true;
      } else if (!hasRole && this.isVisible) {
        this.viewContainer.clear();
        this.isVisible = false;
      }
    }
  }
}
