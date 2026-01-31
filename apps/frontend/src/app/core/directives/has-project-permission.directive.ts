import { Directive, OnChanges, OnInit, TemplateRef, ViewContainerRef, inject, input } from '@angular/core';
import { ProjectRolePermissionEnum } from 'src/app/shared/enums/project-role-permission.enum';

export interface HasProjectPermissionContext {
  requiredPermissions: ProjectRolePermissionEnum[];
  userPermissions: ProjectRolePermissionEnum[];
}

@Directive({
  selector: '[appHasProjectPermission]',
})
export class HasProjectPermissionDirective implements OnInit, OnChanges {
  readonly context = input.required<HasProjectPermissionContext>({ alias: 'appHasProjectPermission' });

  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private isVisible: boolean = false;

  ngOnInit(): void {
    this.updateView();
  }

  ngOnChanges(): void {
    this.updateView();
  }

  private updateView(): void {
    const ctx = this.context();
    const userPerms = ctx.userPermissions || [];
    const required = ctx.requiredPermissions || [];
    const hasPermission = required.some(p => userPerms.includes(p));

    if (hasPermission && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasPermission && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }
}
