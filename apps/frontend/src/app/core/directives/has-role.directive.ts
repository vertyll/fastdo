import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  inject,
} from '@angular/core';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { Role } from 'src/app/shared/enums/role.enum';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit {
  @Input('appHasRole') roles!: Role[];
  private isVisible = false;

  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  ngOnInit() {
    const userRoles = this.authService.getUserRoles();
    if (!userRoles) {
      this.viewContainer.clear();
    } else {
      const hasRole = this.roles.some((role) => userRoles.includes(role));
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
