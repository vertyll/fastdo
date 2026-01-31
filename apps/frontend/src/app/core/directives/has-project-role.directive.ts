import { Directive, ElementRef, OnChanges, OnInit, Renderer2, inject, input } from '@angular/core';
import { ProjectRoleEnum } from 'src/app/shared/enums/project-role.enum';

@Directive({
  selector: '[appHasProjectRole]',
})
export class HasProjectRoleDirective implements OnInit, OnChanges {
  readonly allowedRoles = input.required<ProjectRoleEnum[] | ProjectRoleEnum>({ alias: 'appHasProjectRole' });
  readonly projectUserRole = input<string | undefined>();

  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private originalDisplay: string | null = null;

  ngOnInit(): void {
    this.originalDisplay = this.elementRef.nativeElement.style.display || '';
    this.checkPermissions();
  }

  ngOnChanges(): void {
    this.checkPermissions();
  }

  private checkPermissions(): void {
    const userRole = this.projectUserRole();
    const allowedRoles = this.allowedRoles();

    if (!userRole) {
      this.hideElement();
      return;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasRole = roles.some(role => role === userRole);

    if (hasRole) {
      this.showElement();
    } else {
      this.hideElement();
    }
  }

  private showElement(): void {
    this.renderer.setStyle(this.elementRef.nativeElement, 'display', this.originalDisplay);
  }

  private hideElement(): void {
    this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
  }
}
