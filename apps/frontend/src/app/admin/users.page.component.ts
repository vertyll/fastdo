import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowPath, heroShieldCheck } from '@ng-icons/heroicons/outline';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { concat, forkJoin } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { BadgeComponent } from '../shared/components/atoms/badge.component';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { PaginatorComponent } from '../shared/components/atoms/paginator.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { PaginationParams } from '../shared/defs/filter.defs';
import { ButtonRoleEnum, ModalSizeEnum } from '../shared/enums/modal.enum';
import { ToastTypeEnum } from '../shared/enums/toast-type.enum';
import { ModalService } from '../shared/services/modal.service';
import { NotificationService } from '../shared/services/notification.service';
import { UserRolesPanelComponent } from './components/user-roles-panel.component';
import { RoleAdminApiService } from './data-access/role-admin.api.service';
import { AdminUser, Role } from './defs/role.defs';

@Component({
  selector: 'app-users-page',
  imports: [
    TranslatePipe,
    NgIconComponent,
    BadgeComponent,
    ButtonComponent,
    PaginatorComponent,
    SpinnerComponent,
    TitleComponent,
  ],
  viewProviders: [provideIcons({ heroArrowPath, heroShieldCheck })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <app-title [text]="'Admin.users' | translate" />

        <app-button variant="stroked" (clicked)="load()">
          <ng-icon name="heroArrowPath" size="16" />
          {{ 'Admin.refresh' | translate }}
        </app-button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16"><app-spinner /></div>
      } @else if (failed()) {
        <p class="py-16 text-center text-danger-500">{{ 'Admin.loadError' | translate }}</p>
      } @else if (users().length === 0) {
        <p class="py-16 text-center text-text-secondary dark:text-dark-text-secondary">
          {{ 'Admin.noUsers' | translate }}
        </p>
      } @else {
        <ul class="space-y-3">
          @for (user of users(); track user.id) {
            <li class="rounded-md border border-border-primary dark:border-dark-border-primary p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
                    {{ displayName(user) }}
                  </p>
                  <p class="text-xs text-text-secondary dark:text-dark-text-secondary break-all">{{ user.email }}</p>
                </div>

                <app-button variant="stroked" (clicked)="editRoles(user)">
                  <ng-icon name="heroShieldCheck" size="16" />
                  {{ 'Admin.manageRoles' | translate }}
                </app-button>
              </div>

              @if (user.roles.length === 0) {
                <p class="mt-3 text-xs text-text-secondary dark:text-dark-text-secondary">
                  {{ 'Admin.userHoldsNoRole' | translate }}
                </p>
              } @else {
                <div class="mt-3 flex flex-wrap gap-1.5">
                  @for (role of user.roles; track role) {
                    <app-badge shape="code">{{ role }}</app-badge>
                  }
                </div>
              }
            </li>
          }
        </ul>

        <app-paginator
          [total]="total()"
          [pageSize]="pageSize()"
          [currentPage]="page()"
          (pageChange)="onPageChange($event)"
        />
      }
    </div>
  `,
})
export class UsersPageComponent implements OnInit {
  private readonly api = inject(RoleAdminApiService);
  private readonly translateService = inject(TranslateService);
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly users = signal<AdminUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly total = signal(0);
  protected readonly page = signal(0);
  protected readonly pageSize = signal(25);

  private roles: Role[] = [];
  private panel: UserRolesPanelComponent | null = null;

  public ngOnInit(): void {
    this.load();
  }

  protected displayName(user: AdminUser): string {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  }

  protected onPageChange(params: PaginationParams): void {
    this.page.set(params.page);
    this.pageSize.set(params.pageSize);
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.failed.set(false);

    forkJoin({
      page: this.api.getUsers(this.page(), this.pageSize()),
      roles: this.api.getRoles('GLOBAL'),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ page, roles }) => {
          this.loading.set(false);
          this.users.set(page.content);
          this.total.set(page.totalElements);
          this.roles = roles;
        },
        error: () => {
          this.loading.set(false);
          this.failed.set(true);
        },
      });
  }

  protected editRoles(user: AdminUser): void {
    this.panel = null;

    this.modalService.present({
      title: this.translateService.instant('Admin.manageRolesFor', { name: this.displayName(user) }),
      size: ModalSizeEnum.Medium,
      components: [
        {
          component: UserRolesPanelComponent,
          data: {
            user,
            roles: this.roles,
            register: (panel: UserRolesPanelComponent) => (this.panel = panel),
          },
        },
      ],
      buttons: [
        { role: ButtonRoleEnum.Cancel, text: this.translateService.instant('Basic.cancel') },
        {
          role: ButtonRoleEnum.Ok,
          text: this.translateService.instant('Basic.save'),
          handler: () => this.saveRoles(user),
        },
      ],
    });
  }

  private saveRoles(user: AdminUser): boolean {
    const changes = this.panel?.collect();
    if (!changes || (!changes.granted.length && !changes.revoked.length)) {
      return true;
    }

    concat(
      ...changes.granted.map(name => this.api.assignRole(user.id, name, null)),
      ...changes.revoked.map(name => this.api.removeRole(user.id, name, null)),
    )
      .pipe(toArray(), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.load(),
        error: () => {
          this.showError('Admin.roleAssignError');
          this.load();
        },
      });

    return true;
  }

  private showError(key: string): void {
    this.notificationService.showNotification(this.translateService.instant(key), ToastTypeEnum.Error);
  }
}
