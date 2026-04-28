import { AfterViewInit, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroTrash } from '@ng-icons/heroicons/outline';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { AuthService } from '../auth/data-access/auth.service';
import { HasProjectPermissionDirective } from '../core/directives/has-project-permission.directive';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { CheckboxComponent } from '../shared/components/atoms/checkbox.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';
import { SelectFieldComponent } from '../shared/components/molecules/select-field.component';
import { ImageComponent } from '../shared/components/organisms/image.component';
import { NotificationTypeEnum } from '../shared/enums/notification.enum';
import { ProjectRolePermissionEnum } from '../shared/enums/project-role-permission.enum';
import { NotificationService } from '../shared/services/notification.service';
import { ProjectCategoryService } from './data-access/project-category.service';
import { ProjectRoleService } from './data-access/project-role.service';
import { ProjectStatusService } from './data-access/project-status.service';
import { ProjectTypeService } from './data-access/project-type.service';
import { ProjectsService } from './data-access/project.service';
import { ProjectsStateService } from './data-access/project.state.service';
import { Project } from './defs/project.defs';
import { TextareaFieldComponent } from '../shared/components/molecules/textarea-field.component';
import { TranslatableOptionItem, TranslationItem } from '../shared/defs/common.defs';

type LocalizedOptionItem = TranslatableOptionItem & { name: string };

interface NameColorFormItem {
  id?: number;
  name?: string;
  color?: string;
}

@Component({
  selector: 'app-project-form-page',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    TitleComponent,
    ButtonComponent,
    InputFieldComponent,
    SelectFieldComponent,
    CheckboxComponent,
    ImageComponent,
    HasProjectPermissionDirective,
    TextareaFieldComponent,
    SpinnerComponent,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      heroTrash,
    }),
  ],
  styles: `
    @reference "../../style.css";

    input[type='color'] {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      background-color: transparent;
    }
    input[type='color']::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    input[type='color']::-webkit-color-swatch {
      @apply border border-border-primary dark:border-dark-border-primary rounded-full shadow-sm;
    }
    input[type='color']::-moz-color-swatch {
      @apply border border-border-primary dark:border-dark-border-primary rounded-full shadow-sm;
    }
  `,
  template: `
    <div class="max-w-2xl mx-auto">
      <app-title
        [text]="isEditMode ? ('Project.editProject' | translate) : ('Project.addProject' | translate)"
      ></app-title>

      @if (loading()) {
        <div class="flex justify-center py-10">
          <app-spinner />
        </div>
      } @else {
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="space-y-6 mt-6">
          <app-input-field
            [control]="nameControl"
            id="name"
            [label]="'Project.name' | translate"
            [errorMessage]="getRequiredOrMinLengthError(nameControl)"
          />

          <div class="relative mt-6">
            <app-textarea-field
              id="additionalDescription"
              [control]="descriptionControl"
              [label]="'Project.description' | translate"
            />
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
            <app-checkbox [control]="isPublicControl" [id]="'isPublic'" />
            <label for="isPublic" class="ml-2 block text-sm text-text-primary dark:text-dark-text-primary">
              {{ 'Project.isPublic' | translate }}
            </label>
          </div>

          <div>
            <span id="icon-label" class="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
              {{ 'Project.icon' | translate }}
            </span>
            <app-image
              [initialUrl]="currentProject?.icon?.url ?? null"
              mode="edit"
              size="md"
              format="square"
              (imageSaved)="onImageSaved($event)"
              (croppingChange)="onCroppingChange($event)"
              (imageRemoved)="onImageRemoved()"
              aria-labelledby="icon-label"
            />
          </div>

          <div>
            <span
              id="categories-label"
              class="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2"
            >
              {{ 'Project.categories' | translate }}
            </span>
            <div formArrayName="categories" class="space-y-3" role="group" aria-labelledby="categories-label">
              @for (_ of categoriesFormArray.controls; track $index) {
                <div
                  class="flex gap-3 items-end p-3 border border-border-primary dark:border-dark-border-primary rounded-lg"
                >
                  <div [formGroupName]="$index" class="flex flex-1 gap-3 items-end">
                    <div class="flex-1">
                      <app-input-field
                        [control]="getCategoryNameControl($index)"
                        [id]="'category-name-' + $index"
                        [label]="'Project.categoryName' | translate"
                        [errorMessage]="getRequiredOrMinLengthError(getCategoryNameControl($index))"
                      />
                    </div>
                    <div class="flex flex-col justify-end pb-1">
                      <label [for]="'category-color-' + $index" class="text-xs mb-1">{{
                        'Project.selectColor' | translate
                      }}</label>
                      <input
                        type="color"
                        [id]="'category-color-' + $index"
                        [formControl]="getCategoryColorControl($index)"
                        class="w-11 h-11 cursor-pointer border-0 p-0 overflow-hidden outline-none hover:scale-105 transition-transform"
                        [title]="'Project.selectColor' | translate"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="removeCategory($index)"
                    class="p-2.5 text-danger-600 hover:text-danger-800 dark:text-danger-500 dark:hover:text-danger-400 rounded-md transition-colors"
                    [title]="'Basic.remove' | translate"
                    [attr.aria-label]="'Basic.remove' | translate"
                  >
                    <ng-icon name="heroTrash" size="20"></ng-icon>
                  </button>
                </div>
              }
            </div>
            <button type="button" (click)="addCategory()" class="mt-2 text-primary-600 hover:text-primary-800 text-sm">
              + {{ 'Project.addCategory' | translate }}
            </button>
          </div>

          <div>
            <span
              id="statuses-label"
              class="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2"
            >
              {{ 'Project.statuses' | translate }}
            </span>
            <div formArrayName="statuses" class="space-y-3" role="group" aria-labelledby="statuses-label">
              @for (_ of statusesFormArray.controls; track $index) {
                <div
                  class="flex gap-3 items-end p-3 border border-border-primary dark:border-dark-border-primary rounded-lg"
                >
                  <div [formGroupName]="$index" class="flex flex-1 gap-3 items-end">
                    <div class="flex-1">
                      <app-input-field
                        [control]="getStatusNameControl($index)"
                        [id]="'status-name-' + $index"
                        [label]="'Project.statusName' | translate"
                        [errorMessage]="getRequiredOrMinLengthError(getStatusNameControl($index))"
                      />
                    </div>
                    <div class="flex flex-col justify-end pb-1">
                      <label [for]="'status-color-' + $index" class="text-xs mb-1">{{
                        'Project.selectColor' | translate
                      }}</label>
                      <input
                        type="color"
                        [id]="'status-color-' + $index"
                        [formControl]="getStatusColorControl($index)"
                        class="w-11 h-11 cursor-pointer border-0 p-0 overflow-hidden outline-none hover:scale-105 transition-transform"
                        [title]="'Project.selectColor' | translate"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="removeStatus($index)"
                    class="p-2.5 text-danger-600 hover:text-danger-800 dark:text-danger-500 dark:hover:text-danger-400 rounded-md transition-colors"
                    [title]="'Basic.remove' | translate"
                    [attr.aria-label]="'Basic.remove' | translate"
                  >
                    <ng-icon name="heroTrash" size="20"></ng-icon>
                  </button>
                </div>
              }
            </div>
            <button type="button" (click)="addStatus()" class="mt-2 text-primary-600 hover:text-primary-800 text-sm">
              + {{ 'Project.addStatus' | translate }}
            </button>
          </div>

          <div>
            <span id="users-label" class="block text-sm font-medium text-text-primary dark:text-dark-text-primary mb-2">
              {{ isEditMode ? ('Project.inviteAdditionalUsers' | translate) : ('Project.inviteUsers' | translate) }}
            </span>
            <p class="text-sm text-text-secondary dark:text-dark-text-secondary mb-3">
              {{
                isEditMode
                  ? ('Project.inviteAdditionalUsersDescription' | translate)
                  : ('Project.inviteUsersDescription' | translate)
              }}
            </p>
            <div formArrayName="usersWithRoles" class="space-y-3">
              @for (_ of usersWithRolesFormArray.controls; track $index) {
                <div
                  class="flex flex-col sm:flex-row gap-3 sm:items-end p-3 border border-border-primary dark:border-dark-border-primary rounded-lg"
                  [class.opacity-60]="isCurrentUser($index)"
                  [class.pointer-events-none]="isCurrentUser($index)"
                  [attr.aria-disabled]="isCurrentUser($index) ? 'true' : null"
                  [title]="isCurrentUser($index) ? ('Project.cannotEditYourself' | translate) : null"
                >
                  <div class="flex-1">
                    <app-input-field
                      [control]="getUserEmailControl($index)"
                      [id]="'user-email-' + $index"
                      [label]="'Project.userEmailPlaceholder' | translate"
                      type="email"
                      [errorMessage]="getEmailFieldError(getUserEmailControl($index))"
                    />
                  </div>
                  <div class="flex-1 sm:w-48 sm:flex-none">
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
                    class="p-2.5 text-danger-600 hover:text-danger-800 dark:text-danger-500 dark:hover:text-danger-400 rounded-md transition-colors self-start sm:self-end sm:mb-1"
                    [disabled]="isCurrentUser($index)"
                    [class.opacity-50]="isCurrentUser($index)"
                    [class.cursor-not-allowed]="isCurrentUser($index)"
                    [title]="
                      isCurrentUser($index)
                        ? ('Project.cannotRemoveYourself' | translate)
                        : ('Basic.remove' | translate)
                    "
                    [attr.aria-label]="'Basic.remove' | translate"
                  >
                    <ng-icon name="heroTrash" size="20"></ng-icon>
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
            <app-button type="button" (click)="cancel()" variant="stroked">
              {{ 'Basic.cancel' | translate }}
            </app-button>

            @if (!isEditMode) {
              <app-button type="submit" [disabled]="projectForm.invalid || isSubmitting">
                {{ isSubmitting ? ('Basic.saving' | translate) : ('Basic.save' | translate) }}
              </app-button>
            } @else {
              <ng-container
                *appHasProjectPermission="{
                  requiredPermissions: [ProjectRolePermissionEnum.EDIT_PROJECT],
                  userPermissions: currentProject?.permissions ?? [],
                }"
              >
                <app-button type="submit" [disabled]="projectForm.invalid || isSubmitting">
                  {{ isSubmitting ? ('Basic.saving' | translate) : ('Basic.update' | translate) }}
                </app-button>
              </ng-container>
            }
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
      }
    </div>
  `,
})
export class ProjectFormPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);
  private readonly projectTypeService = inject(ProjectTypeService);
  private readonly projectRoleService = inject(ProjectRoleService);
  private readonly projectStatusService = inject(ProjectStatusService);
  private readonly projectCategoryService = inject(ProjectCategoryService);
  private readonly projectsStateService = inject(ProjectsStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly authService = inject(AuthService);

  private readonly destroy$ = new Subject<void>();

  protected readonly ProjectRolePermissionEnum = ProjectRolePermissionEnum;

  protected projectForm!: FormGroup;
  protected projectTypesRaw: TranslatableOptionItem[] = [];
  protected projectStatusesRaw: TranslatableOptionItem[] = [];
  protected projectCategoriesRaw: TranslatableOptionItem[] = [];
  protected projectRolesRaw: TranslatableOptionItem[] = [];
  protected projectTypes: LocalizedOptionItem[] = [];
  protected projectStatuses: LocalizedOptionItem[] = [];
  protected projectCategories: LocalizedOptionItem[] = [];
  protected projectRoles: LocalizedOptionItem[] = [];
  protected isSubmitting: boolean = false;
  protected readonly loading = signal(true);
  protected isEditMode: boolean = false;
  protected projectId: number | null = null;
  protected currentProject: Project | null = null;
  protected selectedIconFile: File | null = null;
  protected iconRemoved: boolean = false;
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

  ngAfterViewInit(): void {
    this.usersWithRolesFormArray.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.fieldErrors['usersWithRoles']) {
        this.fieldErrors['usersWithRoles'] = [];
      }
    });
  }

  protected get categoriesFormArray(): FormArray {
    return this.projectForm.get('categories') as FormArray;
  }

  protected get statusesFormArray(): FormArray {
    return this.projectForm.get('statuses') as FormArray;
  }

  protected get usersWithRolesFormArray(): FormArray {
    return this.projectForm.get('usersWithRoles') as FormArray;
  }

  protected get nameControl(): FormControl {
    return this.projectForm.get('name') as FormControl;
  }

  protected get descriptionControl(): FormControl {
    return this.projectForm.get('description') as FormControl;
  }

  protected get typeIdControl(): FormControl {
    return this.projectForm.get('typeId') as FormControl;
  }

  protected get isPublicControl(): FormControl {
    return this.projectForm.get('isPublic') as FormControl;
  }

  protected getCategoryNameControl(index: number): FormControl {
    return this.categoriesFormArray.at(index).get('name') as FormControl;
  }

  protected getCategoryColorControl(index: number): FormControl {
    return this.categoriesFormArray.at(index).get('color') as FormControl;
  }

  protected getStatusNameControl(index: number): FormControl {
    return this.statusesFormArray.at(index).get('name') as FormControl;
  }

  protected getStatusColorControl(index: number): FormControl {
    return this.statusesFormArray.at(index).get('color') as FormControl;
  }

  protected getUserEmailControl(index: number): FormControl {
    return this.usersWithRolesFormArray.at(index).get('email') as FormControl;
  }

  protected getUserRoleControl(index: number): FormControl {
    return this.usersWithRolesFormArray.at(index).get('role') as FormControl;
  }

  protected cancel(): void {
    this.router.navigate(['/projects']).then();
  }

  protected getRequiredOrMinLengthError(control: FormControl): string {
    if (!control || !control.touched) return '';
    if (control.hasError('required')) {
      return this.translateService.instant('FormValidationMessage.required');
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return this.translateService.instant('FormValidationMessage.minLength', { minLength: requiredLength });
    }
    return '';
  }

  protected getEmailFieldError(control: FormControl): string {
    if (!control || !control.touched) return '';
    if (control.hasError('required')) {
      return this.translateService.instant('FormValidationMessage.required');
    }
    if (control.hasError('email')) {
      return this.translateService.instant('FormValidationMessage.email');
    }
    if (control.hasError('selfEmail')) {
      return this.translateService.instant('Project.cannotAddYourself');
    }
    return '';
  }

  protected get projectTypeOptions(): Array<{ value: number; label: string }> {
    return this.projectTypes.map(type => ({
      value: type.id,
      label: type.name,
    }));
  }

  protected get projectRoleOptions(): Array<{ value: number; label: string }> {
    return this.projectRoles.map(role => ({
      value: role.id,
      label: role.name,
    }));
  }

  protected addCategory(): void {
    this.categoriesFormArray.push(
      this.fb.group({
        id: [null],
        name: ['', Validators.required],
        color: ['#3B82F6', Validators.required],
      }),
    );
  }

  protected removeCategory(index: number): void {
    this.categoriesFormArray.removeAt(index);
  }

  protected addStatus(): void {
    this.statusesFormArray.push(
      this.fb.group({
        id: [null],
        name: ['', Validators.required],
        color: ['#10B981', Validators.required],
      }),
    );
  }

  protected removeStatus(index: number): void {
    this.statusesFormArray.removeAt(index);
  }

  protected addUserWithRole(): void {
    const currentUserEmail = this.authService.getCurrentUserEmail();
    const notSelfValidator = (control: FormControl): { selfEmail: true } | null => {
      const value = (control.value || '').trim().toLowerCase();
      if (currentUserEmail && value && value === currentUserEmail.trim().toLowerCase()) {
        return { selfEmail: true };
      }
      return null;
    };
    const group = this.fb.group({
      email: ['', [Validators.required, Validators.email, notSelfValidator as any]],
      role: ['', [Validators.required]],
    });
    group
      .get('email')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (currentUserEmail && value?.trim().toLowerCase() === currentUserEmail.trim().toLowerCase()) {
          this.notificationService.showNotification(
            this.translateService.instant('Project.cannotAddYourself'),
            NotificationTypeEnum.Error,
          );
        }
      });
    this.usersWithRolesFormArray.push(group);
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
    if (!userEmail || !currentUserEmail) return false;
    return String(userEmail).trim().toLowerCase() === currentUserEmail.trim().toLowerCase();
  }

  protected onImageSaved(event: { file: File; preview: string | null }): void {
    this.selectedIconFile = event.file;
    this.iconRemoved = false;
  }

  protected onCroppingChange(isCropping: boolean): void {
    this.isCropping = isCropping;
  }

  protected onImageRemoved(): void {
    this.selectedIconFile = null;
    this.iconRemoved = true;
  }

  protected onSubmit(): void {
    if (this.projectForm.invalid || this.isSubmitting || this.isCropping) return;

    this.isSubmitting = true;
    this.fieldErrors = {};

    const formData = this.buildProjectFormData(this.projectForm.getRawValue());
    this.submitProjectForm(formData);
  }

  private buildProjectFormData(formValue: any): FormData {
    const formData = new FormData();

    formData.append('name', formValue.name);
    if (formValue.description) {
      formData.append('description', formValue.description);
    }
    formData.append('isPublic', String(formValue.isPublic || false));
    if (formValue.typeId) {
      formData.append('typeId', formValue.typeId);
    }

    formData.append('categories', JSON.stringify(this.serializeNameColorItems(formValue.categories, '#3B82F6')));
    formData.append('statuses', JSON.stringify(this.serializeNameColorItems(formValue.statuses, '#10B981')));

    this.appendUsersWithRoles(formData, formValue.usersWithRoles);
    this.appendUserEmails(formData, formValue.userEmails);
    this.appendIcon(formData);

    return formData;
  }

  private appendUsersWithRoles(formData: FormData, usersWithRoles: unknown): void {
    if (!Array.isArray(usersWithRoles)) return;

    const payload = usersWithRoles
      .filter((userWithRole: any) => userWithRole.email?.trim())
      .map((userWithRole: any) => ({
        email: userWithRole.email.trim(),
        role: userWithRole.role,
      }));

    formData.append('usersWithRoles', JSON.stringify(payload));
  }

  private appendUserEmails(formData: FormData, userEmails: unknown): void {
    if (!Array.isArray(userEmails)) return;

    userEmails
      .filter((userEmail: any) => userEmail.email?.trim())
      .forEach((userEmail: any) => {
        formData.append('userEmails', userEmail.email.trim());
      });
  }

  private appendIcon(formData: FormData): void {
    const hadIcon = !!this.currentProject?.icon?.url;
    if (this.selectedIconFile) {
      formData.append('icon', this.selectedIconFile);
      return;
    }

    if (hadIcon && this.iconRemoved) {
      formData.append('icon', 'null');
    }
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
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe({
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
    const roles$ = this.projectRoleService.getAll();

    forkJoin({
      types: types$,
      roles: roles$,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: responses => {
          this.projectTypesRaw = responses.types.data || [];
          this.projectRolesRaw = responses.roles.data || [];
          this.updateOptionsForCurrentLang();

          if (this.isEditMode && this.projectId) {
            this.loadProjectSpecificData();
          } else {
            this.loading.set(false);
          }
        },
        error: error => {
          console.error('Error loading project options:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Project.loadError'),
            NotificationTypeEnum.Error,
          );
          this.loading.set(false);
        },
      });
  }

  private loadProjectSpecificData(): void {
    if (!this.projectId) return;

    const statuses$ = this.projectStatusService.getByProjectId(this.projectId);
    const categories$ = this.projectCategoryService.getByProjectId(this.projectId);

    forkJoin({
      statuses: statuses$,
      categories: categories$,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
          this.loading.set(false);
        },
      });
  }

  private updateOptionsForCurrentLang(): void {
    const lang = this.translateService.getCurrentLang() || 'pl';
    this.projectTypes = this.mapToLocalizedOptions(this.projectTypesRaw, lang);
    this.projectRoles = this.mapToLocalizedOptions(this.projectRolesRaw, lang);
    this.projectStatuses = this.mapToLocalizedOptions(this.projectStatusesRaw, lang);
    this.projectCategories = this.mapToLocalizedOptions(this.projectCategoriesRaw, lang);
  }

  private mapToLocalizedOptions(items: TranslatableOptionItem[], lang: string): LocalizedOptionItem[] {
    return (items || []).map(item => ({
      ...item,
      name: this.getLocalizedName(item, lang),
    }));
  }

  private getLocalizedName(item: TranslatableOptionItem, lang: string): string {
    return (
      item.translations?.find((translation: TranslationItem) => translation.lang === lang)?.name ||
      item.translations?.[0]?.name ||
      ''
    );
  }

  private serializeNameColorItems(
    items: unknown,
    defaultColor: string,
  ): Array<{ id?: number; name: string; color: string }> {
    if (!Array.isArray(items)) return [];

    return (items as NameColorFormItem[])
      .filter(item => item.name?.trim())
      .map(item => ({
        ...(item.id ? { id: item.id } : {}),
        name: item.name!.trim(),
        color: item.color || defaultColor,
      }));
  }

  private loadProject(): void {
    if (!this.projectId) return;

    const currentLang = this.translateService.getCurrentLang() || 'pl';

    this.projectsService
      .getProjectByIdWithDetails(this.projectId, currentLang)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.currentProject = response.data;
          this.populateForm();
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading project:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Project.loadError'),
            NotificationTypeEnum.Error,
          );
          this.loading.set(false);
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
        this.categoriesFormArray.push(
          this.fb.group({
            id: [category.id],
            name: [category.name || '', Validators.required],
            color: [category.color || '#3B82F6', Validators.required],
          }),
        );
      });
    }

    if (this.currentProject.statuses) {
      this.currentProject.statuses.forEach(status => {
        this.statusesFormArray.push(
          this.fb.group({
            id: [status.id],
            name: [status.name || '', Validators.required],
            color: [status.color || '#10B981', Validators.required],
          }),
        );
      });
    }

    if (this.currentProject.projectUserRoles) {
      const currentUserEmail = this.authService.getCurrentUserEmail();
      this.currentProject.projectUserRoles.forEach(projectUserRole => {
        const isSelf =
          !!currentUserEmail &&
          projectUserRole.user.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase();
        this.usersWithRolesFormArray.push(
          this.fb.group({
            email: [{ value: projectUserRole.user.email, disabled: isSelf }, [Validators.required, Validators.email]],
            role: [{ value: projectUserRole.projectRole.id, disabled: isSelf }, Validators.required],
          }),
        );
      });
    }
  }

  private loadCurrentUser(): void {
    const currentUserEmail = this.authService.getCurrentUserEmail();
    if (!currentUserEmail) {
      console.warn('No current user email found in JWT token');
    }
  }

  private submitProjectForm(formData: FormData): void {
    if (this.isEditMode && this.projectId) {
      this.projectsService
        .updateFull(this.projectId, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const successMessage = this.translateService.instant('Project.updateSuccess');
            this.notificationService.showNotification(successMessage, NotificationTypeEnum.Success);
            this.router.navigate(['/projects']).then();
            this.isSubmitting = false;
          },
          error: error => this.handleSubmitError(error, true),
          complete: () => {
            this.isSubmitting = false;
          },
        });
      return;
    }

    this.projectsService
      .add(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.projectsStateService.addProject(response.data);
          const successMessage = this.translateService.instant('Project.addSuccess');
          this.notificationService.showNotification(successMessage, NotificationTypeEnum.Success);
          this.router.navigate(['/projects']).then();
          this.isSubmitting = false;
        },
        error: error => this.handleSubmitError(error, false),
        complete: () => {
          this.isSubmitting = false;
        },
      });
  }

  private handleSubmitError(error: any, isUpdate: boolean): void {
    this.isSubmitting = false;
    if (error?.error?.errors?.message && Array.isArray(error.error.errors.message)) {
      this.fieldErrors = {};
      error.error.errors.message.forEach((errObj: any) => {
        if (errObj.field && Array.isArray(errObj.errors)) {
          this.fieldErrors[errObj.field] = errObj.errors;
        }
      });
      return;
    }

    const errorMessage =
      error.error?.message || this.translateService.instant(isUpdate ? 'Project.updateError' : 'Project.addError');
    if (
      typeof errorMessage === 'string' &&
      errorMessage.toLowerCase().includes('user') &&
      errorMessage.toLowerCase().includes('not found')
    ) {
      this.fieldErrors['usersWithRoles'] = [errorMessage];
    }
    this.notificationService.showNotification(errorMessage, NotificationTypeEnum.Error);
  }
}
