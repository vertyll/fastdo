import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CheckboxComponent } from '../../shared/components/atoms/checkbox.component';
import { InputFieldComponent } from '../../shared/components/molecules/input-field.component';
import { SelectFieldComponent } from '../../shared/components/molecules/select-field.component';
import { PermissionModule, Role, RoleScope } from '../defs/role.defs';

export type RoleEditResult = {
  name: string;
  description: string | null;
  permissions: string[];
  scope: RoleScope;
};

type PermissionRow = {
  name: string;
  description: string | null;
  control: FormControl<boolean>;
};

type ModuleGroup = {
  module: string;
  rows: PermissionRow[];
};

@Component({
  selector: 'app-role-edit-panel',
  imports: [ReactiveFormsModule, TranslatePipe, CheckboxComponent, InputFieldComponent, SelectFieldComponent],
  template: `
    <div class="space-y-5 text-left max-h-[60vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <app-input-field
          [control]="nameControl"
          [label]="'Admin.roleName' | translate"
          id="roleName"
          [errorMessage]="'Admin.roleNameInvalid' | translate"
        />
        <app-select-field
          [control]="scopeControl"
          [label]="'Admin.roleScope' | translate"
          id="roleScope"
          [options]="scopeOptions"
        />
      </div>

      <app-input-field [control]="descriptionControl" [label]="'Admin.roleDescription' | translate" id="roleDesc" />

      @if (unrestricted()) {
        <p
          class="rounded-md bg-surface-secondary dark:bg-dark-surface-secondary p-3 text-sm text-text-secondary dark:text-dark-text-secondary"
        >
          {{ 'Admin.roleUnrestrictedHint' | translate }}
        </p>
      }

      @for (group of groups(); track group.module) {
        <section class="pb-4 border-b border-border-primary dark:border-dark-border-primary last:border-b-0">
          <div class="flex items-center justify-between gap-3 mb-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-dark-text-secondary">
              {{ group.module }}
            </p>
            @if (!unrestricted()) {
              <button
                type="button"
                class="text-xs text-primary-600 dark:text-primary-300 hover:underline"
                (click)="toggleModule(group)"
              >
                {{ (allChecked(group) ? 'Admin.clearAll' : 'Admin.selectAll') | translate }}
              </button>
            }
          </div>

          <div class="space-y-1 pl-3 border-l-2 border-border-primary dark:border-dark-border-primary">
            @for (row of group.rows; track row.name) {
              <div class="grid grid-cols-[2rem_1fr] items-center gap-2">
                <app-checkbox class="-ml-[11px]" [control]="row.control" [id]="'perm-' + row.name" />
                <label [attr.for]="'perm-' + row.name + '-input'" class="cursor-pointer min-w-0">
                  <span class="block font-mono text-sm text-text-primary dark:text-dark-text-primary break-all">
                    {{ row.name }}
                  </span>
                  @if (row.description) {
                    <span class="block text-xs text-text-secondary dark:text-dark-text-secondary">
                      {{ row.description }}
                    </span>
                  }
                </label>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class RoleEditPanelComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public role: Role | null = null;
  public modules: PermissionModule[] = [];
  public register?: (panel: RoleEditPanelComponent) => void;

  protected readonly groups = signal<ModuleGroup[]>([]);
  protected readonly unrestricted = signal(false);

  protected readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^[A-Za-z]\w*$/)],
  });
  protected readonly descriptionControl = new FormControl('', { nonNullable: true });
  protected readonly scopeControl = new FormControl<RoleScope>('GLOBAL', { nonNullable: true });

  protected readonly scopeOptions = [
    { value: 'GLOBAL', label: 'Admin.scopeGlobal' },
    { value: 'PROJECT', label: 'Admin.scopeProject' },
  ];

  public ngOnInit(): void {
    this.nameControl.setValue(this.role?.name ?? '');
    this.descriptionControl.setValue(this.role?.description ?? '');
    this.scopeControl.setValue(this.role?.scope ?? 'GLOBAL');
    this.unrestricted.set(this.role?.unrestricted ?? false);

    if (this.role) {
      this.nameControl.disable();
      this.scopeControl.disable();
    }

    this.showPermissionsFor(this.scopeControl.value);
    this.scopeControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(scope => this.showPermissionsFor(scope));

    this.register?.(this);
  }

  private showPermissionsFor(scope: RoleScope): void {
    const granted = new Set(this.role?.permissions ?? []);
    const holdsEverything = this.unrestricted();

    this.groups.set(
      this.modules
        .map(module => ({
          module: module.module,
          rows: module.permissions
            .filter(permission => permission.scope === scope)
            .map(permission => ({
              name: permission.name,
              description: permission.description,
              control: new FormControl(
                { value: holdsEverything || granted.has(permission.name), disabled: holdsEverything },
                { nonNullable: true },
              ),
            })),
        }))
        .filter(group => group.rows.length > 0),
    );
  }

  protected allChecked(group: ModuleGroup): boolean {
    return group.rows.every(row => row.control.value);
  }

  protected toggleModule(group: ModuleGroup): void {
    const next = !this.allChecked(group);
    group.rows.forEach(row => row.control.setValue(next));
  }

  public collect(): RoleEditResult | null {
    const name = this.nameControl.value.trim().toUpperCase();

    if (!this.role && this.nameControl.invalid) {
      this.nameControl.markAsTouched();
      return null;
    }

    return {
      name: this.role?.name ?? name,
      description: this.descriptionControl.value.trim() || null,
      permissions: this.unrestricted()
        ? (this.role?.permissions ?? [])
        : this.groups()
            .flatMap(group => group.rows)
            .filter(row => row.control.value)
            .map(row => row.name),
      scope: this.role?.scope ?? this.scopeControl.value,
    };
  }
}
