import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CheckboxComponent } from '../../shared/components/atoms/checkbox.component';
import { AdminUser, Role } from '../defs/role.defs';

type RoleRow = {
  name: string;
  description: string | null;
  scope: string;
  held: boolean;
  control: FormControl<boolean>;
};

@Component({
  selector: 'app-user-roles-panel',
  imports: [ReactiveFormsModule, TranslatePipe, CheckboxComponent],
  template: `
    <div class="space-y-1 text-left max-h-[55vh] overflow-y-auto pr-1">
      @if (rows().length === 0) {
        <p class="py-6 text-center text-sm text-text-secondary dark:text-dark-text-secondary">
          {{ 'Admin.noRoles' | translate }}
        </p>
      }
      @for (row of rows(); track row.name) {
        <div class="grid grid-cols-[2rem_1fr] items-center gap-2">
          <app-checkbox class="-ml-[11px]" [control]="row.control" [id]="'role-' + row.name" />
          <label [attr.for]="'role-' + row.name + '-input'" class="cursor-pointer min-w-0">
            <span class="block font-mono text-sm text-text-primary dark:text-dark-text-primary">{{ row.name }}</span>
            @if (row.description) {
              <span class="block text-xs text-text-secondary dark:text-dark-text-secondary">{{ row.description }}</span>
            }
          </label>
        </div>
      }
    </div>
  `,
})
export class UserRolesPanelComponent implements OnInit {
  public user!: AdminUser;
  public roles: Role[] = [];
  public register?: (panel: UserRolesPanelComponent) => void;

  protected readonly rows = signal<RoleRow[]>([]);

  public ngOnInit(): void {
    const held = new Set(this.user.roles);

    this.rows.set(
      this.roles
        .filter(role => role.scope === 'GLOBAL')
        .map(role => ({
          name: role.name,
          description: role.description,
          scope: role.scope,
          held: held.has(role.name),
          control: new FormControl(held.has(role.name), { nonNullable: true }),
        })),
    );

    this.register?.(this);
  }

  public collect(): { granted: string[]; revoked: string[] } {
    const rows = this.rows();
    return {
      granted: rows.filter(row => row.control.value && !row.held).map(row => row.name),
      revoked: rows.filter(row => !row.control.value && row.held).map(row => row.name),
    };
  }
}
