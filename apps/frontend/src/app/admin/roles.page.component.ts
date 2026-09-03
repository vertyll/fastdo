import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowPath, heroPencil, heroPlus, heroTrash } from '@ng-icons/heroicons/outline';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { BadgeComponent } from '../shared/components/atoms/badge.component';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { PaginatorComponent } from '../shared/components/atoms/paginator.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { FilterGroupComponent } from '../shared/components/organisms/filter-group.component';
import { FilterMetadata, PaginationParams } from '../shared/defs/filter.defs';
import { FilterTypeEnum } from '../shared/enums/filter-type.enum';
import { ButtonRoleEnum, ModalSizeEnum } from '../shared/enums/modal.enum';
import { ToastTypeEnum } from '../shared/enums/toast-type.enum';
import { ModalService } from '../shared/services/modal.service';
import { NotificationService } from '../shared/services/notification.service';
import { RoleEditPanelComponent } from './components/role-edit-panel.component';
import { RoleAdminApiService } from './data-access/role-admin.api.service';
import { PermissionModule, Role, RoleScope } from './defs/role.defs';

type RoleFilters = {
  searchTerm?: string;
  scope?: RoleScope | '';
};

@Component({
  selector: 'app-roles-page',
  imports: [
    TranslatePipe,
    NgIconComponent,
    BadgeComponent,
    ButtonComponent,
    FilterGroupComponent,
    PaginatorComponent,
    SpinnerComponent,
    TitleComponent,
  ],
  viewProviders: [provideIcons({ heroArrowPath, heroPencil, heroPlus, heroTrash })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <app-title [text]="'Admin.roles' | translate" />

        <div class="flex flex-wrap items-center gap-2">
          <app-button variant="stroked" (clicked)="load()">
            <ng-icon name="heroArrowPath" size="16" />
            {{ 'Admin.refresh' | translate }}
          </app-button>
          <app-button (clicked)="createRole()">
            <ng-icon name="heroPlus" size="16" />
            {{ 'Admin.newRole' | translate }}
          </app-button>
        </div>
      </div>

      <div
        class="rounded-lg border border-border-primary dark:border-dark-border-primary bg-background-secondary dark:bg-dark-background-secondary px-4 py-3"
      >
        <app-filter-group
          [filters]="filterMetadata"
          type="roles"
          scope="admin"
          [collapsible]="true"
          [totalResults]="filtered().length"
          (filterChange)="onFilterChange($event)"
        />
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16"><app-spinner /></div>
      } @else if (failed()) {
        <p class="py-16 text-center text-danger-500">{{ 'Admin.loadError' | translate }}</p>
      } @else if (filtered().length === 0) {
        <p class="py-16 text-center text-text-secondary dark:text-dark-text-secondary">
          {{ 'Admin.noRoles' | translate }}
        </p>
      } @else {
        <ul class="space-y-3">
          @for (role of visible(); track role.id) {
            <li
              class="rounded-md border border-border-primary dark:border-dark-border-primary bg-background-secondary dark:bg-dark-background-secondary p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-mono text-sm font-semibold text-text-primary dark:text-dark-text-primary">
                      {{ role.name }}
                    </span>
                    <app-badge>
                      {{ (role.scope === 'PROJECT' ? 'Admin.scopeProject' : 'Admin.scopeGlobal') | translate }}
                    </app-badge>
                    @if (role.unrestricted) {
                      <app-badge variant="accent">{{ 'Admin.roleUnrestricted' | translate }}</app-badge>
                    }
                    @if (role.system) {
                      <app-badge>{{ 'Admin.roleSystem' | translate }}</app-badge>
                    }
                  </div>
                  @if (role.description) {
                    <p class="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">{{ role.description }}</p>
                  }
                </div>

                <div class="flex items-center gap-1">
                  <app-button variant="icon" [title]="'Basic.edit' | translate" (clicked)="editRole(role)">
                    <ng-icon name="heroPencil" size="16" />
                  </app-button>
                  @if (!role.system) {
                    <app-button variant="icon" [title]="'Basic.delete' | translate" (clicked)="confirmDelete(role)">
                      <ng-icon name="heroTrash" size="16" />
                    </app-button>
                  }
                </div>
              </div>

              @if (role.unrestricted) {
                <p class="mt-3 text-xs text-text-secondary dark:text-dark-text-secondary">
                  {{ 'Admin.roleUnrestrictedHint' | translate }}
                </p>
              } @else if (role.permissions.length === 0) {
                <p class="mt-3 text-xs text-text-secondary dark:text-dark-text-secondary">
                  {{ 'Admin.roleGrantsNothing' | translate }}
                </p>
              } @else {
                <div class="mt-3 flex flex-wrap gap-1.5">
                  @for (permission of role.permissions; track permission) {
                    <app-badge shape="code">{{ permission }}</app-badge>
                  }
                </div>
              }
            </li>
          }
        </ul>

        <app-paginator
          [total]="filtered().length"
          [pageSize]="pageSize()"
          [currentPage]="page()"
          (pageChange)="onPageChange($event)"
        />
      }
    </div>
  `,
})
export class RolesPageComponent implements OnInit {
  private readonly api = inject(RoleAdminApiService);
  private readonly translateService = inject(TranslateService);
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly roles = signal<Role[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly page = signal(0);
  protected readonly pageSize = signal(25);

  private readonly filters = signal<RoleFilters>({});

  protected readonly filtered = computed(() => {
    const { searchTerm, scope } = this.filters();
    const term = searchTerm?.trim().toLowerCase();

    return this.roles().filter(role => {
      if (scope && role.scope !== scope) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        role.name.toLowerCase().includes(term) ||
        (role.description ?? '').toLowerCase().includes(term) ||
        role.permissions.some(permission => permission.toLowerCase().includes(term))
      );
    });
  });

  protected readonly visible = computed(() => {
    const from = this.page() * this.pageSize();
    return this.filtered().slice(from, from + this.pageSize());
  });

  protected readonly filterMetadata: FilterMetadata[] = [
    { type: FilterTypeEnum.Text, formControlName: 'searchTerm', labelKey: 'Admin.searchRoles' },
    {
      type: FilterTypeEnum.Select,
      formControlName: 'scope',
      labelKey: 'Admin.roleScope',
      defaultValue: '',
      options: [
        { value: '', label: 'Admin.allScopes' },
        { value: 'GLOBAL', label: 'Admin.scopeGlobal' },
        { value: 'PROJECT', label: 'Admin.scopeProject' },
      ],
    },
  ];

  private modules: PermissionModule[] = [];
  private panel: RoleEditPanelComponent | null = null;

  public ngOnInit(): void {
    this.load();
  }

  protected onFilterChange(values: RoleFilters): void {
    this.filters.set(values);
    this.page.set(0);
  }

  protected onPageChange(params: PaginationParams): void {
    this.page.set(params.page);
    this.pageSize.set(params.pageSize);
  }

  protected load(): void {
    this.loading.set(true);
    this.failed.set(false);

    forkJoin({
      roles: this.api.getRoles(),
      modules: this.api.getPermissionModules(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ roles, modules }) => {
          this.loading.set(false);
          this.roles.set(roles);
          this.modules = modules;
        },
        error: () => {
          this.loading.set(false);
          this.failed.set(true);
        },
      });
  }

  protected createRole(): void {
    this.openEditor(null);
  }

  protected editRole(role: Role): void {
    this.openEditor(role);
  }

  protected confirmDelete(role: Role): void {
    this.modalService.present({
      title: this.translateService.instant('Admin.deleteRoleTitle'),
      message: this.translateService.instant('Admin.deleteRoleMessage', { name: role.name }),
      buttons: [
        { role: ButtonRoleEnum.Cancel, text: this.translateService.instant('Basic.cancel') },
        {
          role: ButtonRoleEnum.Reject,
          text: this.translateService.instant('Basic.delete'),
          handler: () => this.deleteRole(role),
        },
      ],
    });
  }

  private deleteRole(role: Role): boolean {
    this.api
      .deleteRole(role.name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.load(),
        error: () => this.showError('Admin.roleDeleteError'),
      });
    return true;
  }

  private openEditor(role: Role | null): void {
    this.panel = null;

    this.modalService.present({
      title: this.translateService.instant(role ? 'Admin.editRoleTitle' : 'Admin.newRole'),
      size: ModalSizeEnum.Large,
      components: [
        {
          component: RoleEditPanelComponent,
          data: {
            role,
            modules: this.modules,
            register: (panel: RoleEditPanelComponent) => (this.panel = panel),
          },
        },
      ],
      buttons: [
        { role: ButtonRoleEnum.Cancel, text: this.translateService.instant('Basic.cancel') },
        {
          role: ButtonRoleEnum.Ok,
          text: this.translateService.instant('Basic.save'),
          handler: () => this.save(role),
        },
      ],
    });
  }

  private save(existing: Role | null): boolean {
    const edited = this.panel?.collect();
    if (!edited) {
      return false;
    }

    const request = existing
      ? this.api.updateRole(
          existing.name,
          { description: edited.description, permissions: edited.permissions },
          existing.version,
        )
      : this.api.createRole(edited);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.load(),
      error: () => this.showError('Admin.roleSaveError'),
    });

    return true;
  }

  private showError(key: string): void {
    this.notificationService.showNotification(this.translateService.instant(key), ToastTypeEnum.Error);
  }
}
