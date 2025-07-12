import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { AuthService } from '../auth/data-access/auth.service';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { CheckboxComponent } from '../shared/components/atoms/checkbox.component';
import { TextareaComponent } from '../shared/components/atoms/textarea-component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';
import { SelectFieldComponent } from '../shared/components/molecules/select-field.component';
import { ImageComponent } from '../shared/components/organisms/image.component';
import { NotificationTypeEnum } from '../shared/enums/notification.enum';
import { NotificationService } from '../shared/services/notification.service';
import { ProjectCategoryApiService } from './data-access/project-category.api.service';
import { ProjectRoleApiService } from './data-access/project-role.api.service';
import { ProjectStatusApiService } from './data-access/project-status.api.service';
import { ProjectTypeService } from './data-access/project-type.service';
import { ProjectsService } from './data-access/project.service';
import { ProjectsStateService } from './data-access/project.state.service';
import { AddProjectDto } from './dtos/add-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { Project } from './models/Project';

@Component({
  selector: 'app-project-form-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TitleComponent,
    ButtonComponent,
    InputFieldComponent,
    SelectFieldComponent,
    TextareaComponent,
    CheckboxComponent,
    ImageComponent,
  ],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <app-title>
        {{ isEditMode ? ('Project.editProject' | translate) : ('Project.addProject' | translate) }}
      </app-title>

      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="space-y-6 mt-6">
        <app-input-field
          [control]="nameControl"
          id="name"
          [label]="('Project.name' | translate) + ' *'"
        />

        <div class="relative">
          <app-textarea
            [control]="descriptionControl"
            id="description"
            [placeholder]="'Project.descriptionPlaceholder' | translate"
            [rows]="4"
          />
          <label for="description" class="absolute left-2 -top-2 text-xs text-text-secondary dark:text-dark-text-secondary bg-background-primary dark:bg-dark-background-primary px-1">
            {{ 'Project.description' | translate }}
          </label>
        </div>

        <div class="mt-6">
          <app-select-field
            [control]="typeIdControl"
            id="typeId"
            [label]="'Project.type' | translate"
            [placeholder]="'Project.selectType' | translate"
            [options]="projectTypeOptions"
          />
        </div>

        <div class="flex items-center">
          <app-checkbox
            [control]="isPublicControl"
            id="isPublic"
          />
          <label for="isPublic" class="ml-2 block text-sm text-text-primary dark:text-dark-text-primary">
            {{ 'Project.isPublic' | translate }}
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
            {{ 'Project.icon' | translate }}
          </label>
          <app-image
            [initialUrl]="currentProject?.icon?.url ?? null"
            mode="edit"
            size="md"
            format="square"
            (imageSaved)="onImageSaved($event)"
            (croppingChange)="onCroppingChange($event)"
            (imageRemoved)="onImageRemoved()"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
            {{ 'Project.categories' | translate }}
          </label>
          <div formArrayName="categories" class="space-y-3">
            @for (category of categoriesFormArray.controls; track $index) {
              <div class="flex gap-3 items-end p-3 border border-border-primary dark:border-dark-border-primary rounded-lg">
                <div [formGroupName]="$index" class="flex flex-1 gap-3 items-end">
                  <div class="flex-1">
                    <app-input-field
                      [control]="getCategoryNameControl($index)"
                      [id]="'category-name-' + $index"
                      [label]="'Project.categoryName' | translate"
                    />
                  </div>
                  <div class="flex flex-col justify-end pb-1">
                    <label class="text-xs text-text-secondary mb-1">{{ 'Project.selectColor' | translate }}</label>
                    <input
                      type="color"
                      [formControl]="getCategoryColorControl($index)"
                      class="w-12 h-11 border border-border-primary dark:border-dark-border-primary rounded-md cursor-pointer"
                      [title]="'Project.selectColor' | translate"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  (click)="removeCategory($index)"
                  class="px-3 py-2 text-danger-600 hover:text-danger-800 rounded-md hover:bg-danger-50 dark:hover:bg-danger-900"
                >
                  {{ 'Basic.remove' | translate }}
                </button>
              </div>
            }
          </div>
          <button
            type="button"
            (click)="addCategory()"
            class="mt-2 text-primary-600 hover:text-primary-800 text-sm"
          >
            + {{ 'Project.addCategory' | translate }}
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
            {{ 'Project.statuses' | translate }}
          </label>
          <div formArrayName="statuses" class="space-y-3">
            @for (status of statusesFormArray.controls; track $index) {
              <div class="flex gap-3 items-end p-3 border border-border-primary dark:border-dark-border-primary rounded-lg bg-surface-secondary dark:bg-dark-surface-secondary">
                <div [formGroupName]="$index" class="flex flex-1 gap-3 items-end">
                  <div class="flex-1">
                    <app-input-field
                      [control]="getStatusNameControl($index)"
                      [id]="'status-name-' + $index"
                      [label]="'Project.statusName' | translate"
                    />
                  </div>
                  <div class="flex flex-col justify-end pb-1">
                    <label class="text-xs text-text-secondary mb-1">{{ 'Project.selectColor' | translate }}</label>
                    <input
                      type="color"
                      [formControl]="getStatusColorControl($index)"
                      class="w-12 h-11 border border-border-primary dark:border-dark-border-primary rounded-md cursor-pointer bg-background-primary dark:bg-dark-background-primary"
                      [title]="'Project.selectColor' | translate"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  (click)="removeStatus($index)"
                  class="px-3 py-2 text-danger-600 hover:text-danger-800 rounded-md hover:bg-danger-50 dark:hover:bg-danger-900"
                >
                  {{ 'Basic.remove' | translate }}
                </button>
              </div>
            }
          </div>
          <button
            type="button"
            (click)="addStatus()"
            class="mt-2 text-primary-600 hover:text-primary-800 text-sm"
          >
            + {{ 'Project.addStatus' | translate }}
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
            {{ isEditMode ? ('Project.inviteAdditionalUsers' | translate) : ('Project.inviteUsers' | translate) }}
          </label>
          <p class="text-sm text-text-secondary dark:text-dark-text-secondary mb-3">
            {{ isEditMode ? ('Project.inviteAdditionalUsersDescription' | translate) : ('Project.inviteUsersDescription' | translate) }}
          </p>
          <div formArrayName="usersWithRoles" class="space-y-3">
            @for (userWithRole of usersWithRolesFormArray.controls; track $index) {
              <div class="flex items-end gap-3 p-3 border border-border-primary dark:border-dark-border-primary rounded-lg bg-surface-secondary dark:bg-dark-surface-secondary" [formGroupName]="$index">
                <div class="flex-1">
                  <app-input-field
                    [control]="getUserEmailControl($index)"
                    [id]="'user-email-' + $index"
                    [label]="'Project.userEmailPlaceholder' | translate"
                    type="email"
                  />
                </div>
                <div class="w-48">
                  <app-select-field
                    [control]="getUserRoleControl($index)"
                    [id]="'user-role-' + $index"
                    [label]="'Project.selectRole' | translate"
                    [placeholder]="'Project.selectRole' | translate"
                    [options]="projectRoleOptions"
                  />
                </div>
                <button
                  type="button"
                  (click)="removeUserWithRole($index)"
                  class="px-3 py-2 text-danger-600 hover:text-danger-800 rounded-md hover:bg-danger-50 dark:hover:bg-danger-900"
                  [disabled]="isCurrentUser($index)"
                  [class.opacity-50]="isCurrentUser($index)"
                  [class.cursor-not-allowed]="isCurrentUser($index)"
                  [title]="isCurrentUser($index) ? ('Project.cannotRemoveYourself' | translate) : ('Basic.remove' | translate)"
                >
                  {{ 'Basic.remove' | translate }}
                </button>
              </div>
            }
          </div>
          <button
            type="button"
            (click)="addUserWithRole()"
            class="mt-2 text-primary-600 hover:text-primary-800 text-sm"
          >
            + {{ 'Project.addUserWithRole' | translate }}
          </button>
        </div>

        <div class="flex justify-between items-center pt-6">
          <app-button
            type="button"
            (click)="cancel()"
          >
            {{ 'Basic.cancel' | translate }}
          </app-button>
          <app-button
            type="submit"
            [disabled]="projectForm.invalid || isSubmitting"
          >
            {{ isSubmitting ? ('Basic.saving' | translate) : (isEditMode ? ('Basic.update' | translate) : ('Basic.save' | translate)) }}
          </app-button>
        </div>


        @if (fieldErrors['name']) {
          <div class="mt-1">
            @for (err of fieldErrors['name']; track err) {
              <div class="text-danger-600 text-xs">{{ err }}</div>
            }
          </div>
        }

        @if (fieldErrors['description']) {
          <div class="mt-1">
            @for (err of fieldErrors['description']; track err) {
              <div class="text-danger-600 text-xs">{{ err }}</div>
            }
          </div>
        }

        @if (fieldErrors['typeId']) {
          <div class="mt-1">
            @for (err of fieldErrors['typeId']; track err) {
              <div class="text-danger-600 text-xs">{{ err }}</div>
            }
          </div>
        }

        @if (fieldErrors['categories']) {
          <div class="mt-1">
            @for (err of fieldErrors['categories']; track err) {
              <div class="text-danger-600 text-xs">{{ err }}</div>
            }
          </div>
        }

        @if (fieldErrors['statuses']) {
          <div class="mt-1">
            @for (err of fieldErrors['statuses']; track err) {
              <div class="text-danger-600 text-xs">{{ err }}</div>
            }
          </div>
        }

        @if (fieldErrors['usersWithRoles']) {
          <div class="mt-1">
            @for (err of fieldErrors['usersWithRoles']; track err) {
              <div class="text-danger-600 text-xs">{{ err }}</div>
            }
          </div>
        }
      </form>
    </div>
  `,
})
export class ProjectFormPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);
  private readonly projectTypeService = inject(ProjectTypeService);
  private readonly projectRoleApiService = inject(ProjectRoleApiService);
  private readonly projectStatusApiService = inject(ProjectStatusApiService);
  private readonly projectCategoryApiService = inject(ProjectCategoryApiService);
  private readonly projectsStateService = inject(ProjectsStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly authService = inject(AuthService);

  private destroy$ = new Subject<void>();

  protected projectForm!: FormGroup;
  protected projectTypesRaw: any[] = [];
  protected projectStatusesRaw: any[] = [];
  protected projectCategoriesRaw: any[] = [];
  protected projectRolesRaw: any[] = [];
  protected projectTypes: any[] = [];
  protected projectStatuses: any[] = [];
  protected projectCategories: any[] = [];
  protected projectRoles: any[] = [];
  protected isSubmitting: boolean = false;
  protected isEditMode: boolean = false;
  protected projectId: number | null = null;
  protected currentProject: Project | null = null;
  protected selectedIconFile: File | null = null;
  protected isCropping: boolean = false;
  protected fieldErrors: Record<string, string[]> = {};

  ngOnInit(): void {
    this.checkEditMode();
    this.initializeForm();
    this.loadCurrentUser();
    this.loadAllOptions();
    this.subscribeToLanguageChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.projectId = +id;
    }
  }

  private initializeForm(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      typeId: [''],
      isPublic: [false],
      categories: this.fb.array([]),
      statuses: this.fb.array([]),
      usersWithRoles: this.fb.array([]),
    });
  }

  private subscribeToLanguageChanges(): void {
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.updateOptionsForCurrentLang();
        },
        error: error => {
          console.error('Error handling language change:', error);
        },
      });
  }

  private loadAllOptions(): void {
    const types$ = this.projectTypeService.getAll();
    const roles$ = this.projectRoleApiService.getAll();

    forkJoin({
      types: types$,
      roles: roles$,
    }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: responses => {
        this.projectTypesRaw = responses.types.data || [];
        this.projectRolesRaw = responses.roles.data || [];
        this.updateOptionsForCurrentLang();

        if (this.isEditMode && this.projectId) {
          this.loadProjectSpecificData();
        }
      },
      error: error => {
        console.error('Error loading project options:', error);
        this.notificationService.showNotification(
          this.translateService.instant('Project.loadError'),
          NotificationTypeEnum.Error,
        );
      },
    });
  }

  private loadProjectSpecificData(): void {
    if (!this.projectId) return;

    const statuses$ = this.projectStatusApiService.getByProjectId(this.projectId);
    const categories$ = this.projectCategoryApiService.getByProjectId(this.projectId);

    forkJoin({
      statuses: statuses$,
      categories: categories$,
    }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: responses => {
        this.projectStatusesRaw = responses.statuses.data || [];
        this.projectCategoriesRaw = responses.categories.data || [];
        this.updateOptionsForCurrentLang();
        this.loadProject();
      },
      error: error => {
        console.error('Error loading project-specific data:', error);
        this.notificationService.showNotification(
          this.translateService.instant('Project.loadError'),
          NotificationTypeEnum.Error,
        );
      },
    });
  }

  private updateOptionsForCurrentLang(): void {
    const lang = this.translateService.currentLang || 'pl';
    this.projectTypes = (this.projectTypesRaw || []).map((type: any) => ({
      ...type,
      name: (type.translations?.find((t: any) => t.lang === lang)?.name) || type.translations?.[0]?.name || '',
    }));
    this.projectRoles = (this.projectRolesRaw || []).map((role: any) => ({
      ...role,
      name: (role.translations?.find((t: any) => t.lang === lang)?.name) || role.translations?.[0]?.name || '',
    }));
    this.projectStatuses = (this.projectStatusesRaw || []).map((status: any) => ({
      ...status,
      name: (status.translations?.find((t: any) => t.lang === lang)?.name) || status.translations?.[0]?.name || '',
    }));
    this.projectCategories = (this.projectCategoriesRaw || []).map((cat: any) => ({
      ...cat,
      name: (cat.translations?.find((t: any) => t.lang === lang)?.name) || cat.translations?.[0]?.name || '',
    }));
  }

  private loadProject(): void {
    if (!this.projectId) return;

    const currentLang = this.translateService.currentLang || 'pl';

    this.projectsService.getProjectByIdWithDetails(this.projectId, currentLang)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.currentProject = response.data;
          this.populateForm();
        },
        error: error => {
          console.error('Error loading project:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Project.loadError'),
            NotificationTypeEnum.Error,
          );
          this.router.navigate(['/projects']).then();
        },
      });
  }

  private populateForm(): void {
    if (!this.currentProject) return;

    this.projectForm.patchValue({
      name: this.currentProject.name,
      description: this.currentProject.description || '',
      typeId: this.currentProject.type?.id || '',
      isPublic: this.currentProject.isPublic,
    });

    if (this.currentProject.categories) {
      this.currentProject.categories.forEach(category => {
        this.categoriesFormArray.push(this.fb.group({
          id: [category.id],
          name: [category.name || '', Validators.required],
          color: [category.color || '#3B82F6', Validators.required],
        }));
      });
    }

    if (this.currentProject.statuses) {
      this.currentProject.statuses.forEach(status => {
        this.statusesFormArray.push(this.fb.group({
          id: [status.id],
          name: [status.name || '', Validators.required],
          color: [status.color || '#10B981', Validators.required],
        }));
      });
    }

    if (this.currentProject.projectUserRoles) {
      this.currentProject.projectUserRoles.forEach(projectUserRole => {
        this.usersWithRolesFormArray.push(this.fb.group({
          email: [projectUserRole.user.email, [Validators.required, Validators.email]],
          role: [projectUserRole.projectRole.id, Validators.required],
        }));
      });
    }
  }

  private loadCurrentUser(): void {
    const currentUserEmail = this.authService.getCurrentUserEmail();
    if (!currentUserEmail) {
      console.warn('No current user email found in JWT token');
    }
  }

  get categoriesFormArray(): FormArray {
    return this.projectForm.get('categories') as FormArray;
  }

  get statusesFormArray(): FormArray {
    return this.projectForm.get('statuses') as FormArray;
  }

  get usersWithRolesFormArray(): FormArray {
    return this.projectForm.get('usersWithRoles') as FormArray;
  }

  protected get nameControl() {
    return this.projectForm.get('name') as FormControl;
  }

  protected get descriptionControl() {
    return this.projectForm.get('description') as FormControl;
  }

  protected get typeIdControl() {
    return this.projectForm.get('typeId') as FormControl;
  }

  protected get isPublicControl() {
    return this.projectForm.get('isPublic') as FormControl;
  }

  protected getCategoryNameControl(index: number) {
    return this.categoriesFormArray.at(index).get('name') as FormControl;
  }

  protected getCategoryColorControl(index: number) {
    return this.categoriesFormArray.at(index).get('color') as FormControl;
  }

  protected getStatusNameControl(index: number) {
    return this.statusesFormArray.at(index).get('name') as FormControl;
  }

  protected getStatusColorControl(index: number) {
    return this.statusesFormArray.at(index).get('color') as FormControl;
  }

  protected getUserEmailControl(index: number) {
    return this.usersWithRolesFormArray.at(index).get('email') as FormControl;
  }

  protected getUserRoleControl(index: number) {
    return this.usersWithRolesFormArray.at(index).get('role') as FormControl;
  }

  protected get projectTypeOptions() {
    return this.projectTypes.map(type => ({
      value: type.id,
      label: type.name,
    }));
  }

  protected get projectRoleOptions() {
    return this.projectRoles.map(role => ({
      value: role.id,
      label: role.name,
    }));
  }

  protected addCategory(): void {
    this.categoriesFormArray.push(this.fb.group({
      id: [null],
      name: ['', Validators.required],
      color: ['#3B82F6', Validators.required],
    }));
  }

  protected removeCategory(index: number): void {
    this.categoriesFormArray.removeAt(index);
  }

  protected addStatus(): void {
    this.statusesFormArray.push(this.fb.group({
      id: [null],
      name: ['', Validators.required],
      color: ['#10B981', Validators.required],
    }));
  }

  protected removeStatus(index: number): void {
    this.statusesFormArray.removeAt(index);
  }

  protected addUserWithRole(): void {
    this.usersWithRolesFormArray.push(this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
    }));
  }

  protected removeUserWithRole(index: number): void {
    const userControl = this.usersWithRolesFormArray.at(index);
    const userEmail = userControl.get('email')?.value;
    const currentUserEmail = this.authService.getCurrentUserEmail();

    if (userEmail === currentUserEmail) {
      this.notificationService.showNotification(
        this.translateService.instant('Project.cannotRemoveYourself'),
        NotificationTypeEnum.Error,
      );
      return;
    }

    this.usersWithRolesFormArray.removeAt(index);
  }

  protected isCurrentUser(index: number): boolean {
    const userControl = this.usersWithRolesFormArray.at(index);
    const userEmail = userControl.get('email')?.value;
    const currentUserEmail = this.authService.getCurrentUserEmail();

    return userEmail === currentUserEmail;
  }

  protected onImageSaved(event: { file: File; preview: string | null; }): void {
    this.selectedIconFile = event.file;
  }

  protected onCroppingChange(isCropping: boolean): void {
    this.isCropping = isCropping;
  }

  protected onImageRemoved(): void {
    this.selectedIconFile = null;
  }

  protected onSubmit(): void {
    if (this.projectForm.invalid || this.isSubmitting || this.isCropping) {
      return;
    }

    this.isSubmitting = true;
    this.fieldErrors = {};
    const formValue = this.projectForm.value;

    if (this.isEditMode && this.projectId) {
      const projectData: UpdateProjectDto = {
        name: formValue.name,
        description: formValue.description || undefined,
        isPublic: formValue.isPublic || false,
        typeId: formValue.typeId || undefined,
        categories: formValue.categories
          .filter((cat: any) => cat.name && cat.name.trim())
          .map((cat: any) => cat.name.trim()),
        statuses: formValue.statuses
          .filter((status: any) => status.name && status.name.trim())
          .map((status: any) => status.name.trim()),
        usersWithRoles: formValue.usersWithRoles
          ?.filter((userWithRole: any) => userWithRole.email && userWithRole.email.trim())
          ?.map((userWithRole: any) => ({
            email: userWithRole.email.trim(),
            role: userWithRole.role,
          })) || [],
        userEmails: formValue.userEmails
          ?.filter((userEmail: any) => userEmail.email && userEmail.email.trim())
          ?.map((userEmail: any) => userEmail.email.trim()) || [],
      };

      this.projectsService.updateFull(this.projectId, projectData, this.selectedIconFile)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const successMessage = this.translateService.instant('Project.updateSuccess');
            this.notificationService.showNotification(successMessage, NotificationTypeEnum.Success);
            this.router.navigate(['/projects']).then();
          },
          error: error => {
            if (error?.error?.errors?.message && Array.isArray(error.error.errors.message)) {
              this.fieldErrors = {};
              error.error.errors.message.forEach((errObj: any) => {
                if (errObj.field && Array.isArray(errObj.errors)) {
                  this.fieldErrors[errObj.field] = errObj.errors;
                }
              });
            } else {
              const errorMessage = error.error?.message || this.translateService.instant('Project.updateError');
              this.notificationService.showNotification(errorMessage, NotificationTypeEnum.Error);
            }
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
    } else {
      const projectData: AddProjectDto = {
        name: formValue.name,
        description: formValue.description || undefined,
        isPublic: formValue.isPublic || false,
        typeId: formValue.typeId || undefined,
        categories: formValue.categories
          .filter((cat: any) => cat.name && cat.name.trim())
          .map((cat: any) => cat.name.trim()),
        statuses: formValue.statuses
          .filter((status: any) => status.name && status.name.trim())
          .map((status: any) => status.name.trim()),
        usersWithRoles: formValue.usersWithRoles
          ?.filter((userWithRole: any) => userWithRole.email && userWithRole.email.trim())
          ?.map((userWithRole: any) => ({
            email: userWithRole.email.trim(),
            role: userWithRole.role,
          })) || [],
        userEmails: formValue.userEmails
          ?.filter((userEmail: any) => userEmail.email && userEmail.email.trim())
          ?.map((userEmail: any) => userEmail.email.trim()) || [],
      };

      this.projectsService.add(projectData, this.selectedIconFile)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: response => {
            this.projectsStateService.addProject(response.data);
            const successMessage = this.translateService.instant('Project.addSuccess');
            this.notificationService.showNotification(successMessage, NotificationTypeEnum.Success);
            this.router.navigate(['/projects']).then();
          },
          error: error => {
            if (error?.error?.errors?.message && Array.isArray(error.error.errors.message)) {
              this.fieldErrors = {};
              error.error.errors.message.forEach((errObj: any) => {
                if (errObj.field && Array.isArray(errObj.errors)) {
                  this.fieldErrors[errObj.field] = errObj.errors;
                }
              });
            } else {
              const errorMessage = error.error?.message || this.translateService.instant('Project.addError');
              this.notificationService.showNotification(errorMessage, NotificationTypeEnum.Error);
            }
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
    }
  }

  protected cancel(): void {
    this.router.navigate(['/projects']).then();
  }
}
