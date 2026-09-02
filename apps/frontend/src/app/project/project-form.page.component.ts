import { AfterViewInit, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroTrash } from '@ng-icons/heroicons/outline';
import { Observable, Subject, forkJoin, map, of, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../auth/data-access/auth.service';
import { HasProjectPermissionDirective } from '../core/directives/has-project-permission.directive';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { CheckboxComponent } from '../shared/components/atoms/checkbox.component';
import { SpinnerComponent } from '../shared/components/atoms/spinner.component';
import { TitleComponent } from '../shared/components/atoms/title.component';
import { InputFieldComponent } from '../shared/components/molecules/input-field.component';
import { SelectFieldComponent } from '../shared/components/molecules/select-field.component';
import { ImageComponent } from '../shared/components/organisms/image.component';
import { ToastTypeEnum } from '../shared/enums/toast-type.enum';
import { ProjectRolePermissionEnum } from '../shared/enums/project-role-permission.enum';
import { NotificationService } from '../shared/services/notification.service';
import { ProjectCategoryService } from './data-access/project-category.service';
import { ProjectRoleService } from './data-access/project-role.service';
import { ProjectStatusService } from './data-access/project-status.service';
import { ProjectTypeService } from './data-access/project-type.service';
import { ProjectCategoryApiService } from './data-access/project-category.api.service';
import { ProjectStatusApiService } from './data-access/project-status.api.service';
import { ProjectsApiService } from './data-access/project.api.service';
import { ProjectsService } from './data-access/project.service';
import {
  ProjectCategory,
  ProjectDetails,
  ProjectRole,
  ProjectStatus,
  ProjectType,
  Translation,
} from './defs/project.defs';
import { TextareaFieldComponent } from '../shared/components/molecules/textarea-field.component';
import { FileUploadService } from '../file/data-access/file-upload.service';
import { FileScopeEnum } from '../file/defs/file.defs';
import { errorKeyOf, fieldErrorsOf } from '../shared/utils/api-error.utils';

interface NameColorFormItem {
  id?: string;
  name?: string;
  color?: string;
}

interface ProjectFormValue {
  name: string;
  description?: string | null;
  typeId?: string | null;
  isPublic?: boolean;
  categories?: NameColorFormItem[];
  statuses?: NameColorFormItem[];
  usersWithRoles?: Array<{ email?: string; role?: string }>;
}

const DEFAULT_CATEGORY_COLOR = '#3B82F6';
const DEFAULT_STATUS_COLOR = '#10B981';

@Component({
  selector: 'app-project-form-page',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
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
              [fileId]="iconFileIdValue"
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
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly projectCategoryApi = inject(ProjectCategoryApiService);
  private readonly projectStatusApi = inject(ProjectStatusApiService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly authService = inject(AuthService);

  private readonly destroy$ = new Subject<void>();

  protected readonly ProjectRolePermissionEnum = ProjectRolePermissionEnum;

  protected projectForm!: FormGroup;
  protected projectTypes: ProjectType[] = [];
  protected projectStatuses: ProjectStatus[] = [];
  protected projectCategories: ProjectCategory[] = [];
  protected projectRoles: ProjectRole[] = [];
  protected isSubmitting: boolean = false;
  protected readonly loading = signal(true);
  protected isEditMode: boolean = false;
  protected projectId: string | null = null;
  protected currentProject: ProjectDetails | null = null;
  protected iconFileId: string | null | undefined = undefined;
  protected isUploadingIcon: boolean = false;
  protected isCropping: boolean = false;
  protected fieldErrors: Record<string, string[]> = {};

  ngOnInit(): void {
    this.checkEditMode();
    this.initializeForm();
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
    if (!control?.touched) return '';
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
    if (!control?.touched) return '';
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

  protected get iconFileIdValue(): string | null {
    return this.iconFileId === undefined ? (this.currentProject?.project.iconFileId ?? null) : this.iconFileId;
  }

  protected get projectTypeOptions(): Array<{ value: string; label: string }> {
    return this.projectTypes.map(type => ({ value: type.id, label: type.name }));
  }

  protected get projectRoleOptions(): Array<{ value: string; label: string }> {
    return this.projectRoles.map(role => ({ value: role.id, label: role.name }));
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
            ToastTypeEnum.Error,
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
        ToastTypeEnum.Error,
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
    this.isUploadingIcon = true;
    this.fileUploadService
      .upload(event.file, FileScopeEnum.PROJECT_ICON, this.projectId ?? undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: stored => {
          this.iconFileId = stored.id;
          this.isUploadingIcon = false;
        },
        error: error => {
          console.error('Icon upload failed:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Project.iconUploadError'),
            ToastTypeEnum.Error,
          );
          this.isUploadingIcon = false;
        },
      });
  }

  protected onCroppingChange(isCropping: boolean): void {
    this.isCropping = isCropping;
  }

  protected onImageRemoved(): void {
    this.iconFileId = null;
  }

  protected onSubmit(): void {
    if (this.projectForm.invalid || this.isSubmitting || this.isCropping || this.isUploadingIcon) return;

    this.isSubmitting = true;
    this.fieldErrors = {};

    this.submitProjectForm(this.projectForm.getRawValue());
  }

  private submitProjectForm(formValue: ProjectFormValue): void {
    const payload = {
      name: formValue.name,
      description: formValue.description || null,
      isPublic: formValue.isPublic ?? false,
      typeId: formValue.typeId || null,
      ...(this.iconFileId === undefined ? {} : { iconFileId: this.iconFileId }),
    };

    const save$ =
      this.isEditMode && this.projectId
        ? this.projectsService.update(this.projectId, payload, this.currentProject?.project.version ?? null)
        : this.projectsService.add(payload);

    save$
      .pipe(
        switchMap(response => {
          const projectId = response.data.id;
          return this.saveReferenceData(projectId, formValue).pipe(map(() => response));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          const key = this.isEditMode ? 'Project.updateSuccess' : 'Project.addSuccess';
          this.notificationService.showNotification(this.translateService.instant(key), ToastTypeEnum.Success);
          this.router.navigate(['/projects']).then();
          this.isSubmitting = false;
        },
        error: (error: unknown) => this.handleSubmitError(error, this.isEditMode),
      });
  }

  private saveReferenceData(projectId: string, formValue: ProjectFormValue): Observable<unknown> {
    const writes: Observable<unknown>[] = [];

    for (const item of this.namedColorItems(formValue.categories, DEFAULT_CATEGORY_COLOR)) {
      const existing = this.projectCategories.find(category => category.id === item.id);
      const payload = { color: item.color, translations: this.translationsFor(item.name), isActive: true };
      writes.push(
        existing
          ? this.projectCategoryApi.update(projectId, existing.id, payload, existing.version)
          : this.projectCategoryApi.create(projectId, payload),
      );
    }

    for (const item of this.namedColorItems(formValue.statuses, DEFAULT_STATUS_COLOR)) {
      const existing = this.projectStatuses.find(status => status.id === item.id);
      const payload = { color: item.color, translations: this.translationsFor(item.name), isActive: true };
      writes.push(
        existing
          ? this.projectStatusApi.update(projectId, existing.id, payload, existing.version)
          : this.projectStatusApi.create(projectId, payload),
      );
    }

    const alreadyMember = new Set((this.currentProject?.members ?? []).map(member => member.email.toLowerCase()));
    for (const invite of formValue.usersWithRoles ?? []) {
      const email = invite.email?.trim();
      if (email && !alreadyMember.has(email.toLowerCase())) {
        writes.push(this.projectsApi.invite(projectId, email, invite.role || null));
      }
    }

    return writes.length === 0 ? of(null) : forkJoin(writes);
  }

  private translationsFor(name: string): Translation[] {
    return this.translateService.getLangs().map(language => ({ language, name }));
  }

  private namedColorItems(items: NameColorFormItem[] | undefined, defaultColor: string): Required<NameColorFormItem>[] {
    return (items ?? [])
      .filter(item => item.name?.trim())
      .map(item => ({ id: item.id ?? '', name: item.name!.trim(), color: item.color || defaultColor }));
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.projectId = id;
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
        this.loadAllOptions();
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
          this.projectTypes = responses.types.data || [];
          this.projectRoles = responses.roles.data || [];

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
            ToastTypeEnum.Error,
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
          this.projectStatuses = responses.statuses.data || [];
          this.projectCategories = responses.categories.data || [];
          this.loadProject();
        },
        error: error => {
          console.error('Error loading project-specific data:', error);
          this.notificationService.showNotification(
            this.translateService.instant('Project.loadError'),
            ToastTypeEnum.Error,
          );
          this.loading.set(false);
        },
      });
  }

  private loadProject(): void {
    if (!this.projectId) return;

    this.projectsService
      .getProjectByIdWithDetails(this.projectId)
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
            ToastTypeEnum.Error,
          );
          this.loading.set(false);
          this.router.navigate(['/projects']).then();
        },
      });
  }

  private populateForm(): void {
    if (!this.currentProject) return;

    const project = this.currentProject.project;
    this.projectForm.patchValue({
      name: project.name,
      description: project.description || '',
      typeId: project.typeId || '',
      isPublic: project.isPublic,
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

    const currentUserEmail = this.authService.getCurrentUserEmail();
    this.currentProject.members.forEach(member => {
      const isSelf = !!currentUserEmail && member.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase();
      this.usersWithRolesFormArray.push(
        this.fb.group({
          email: [{ value: member.email, disabled: isSelf }, [Validators.required, Validators.email]],
          role: [{ value: member.roleId, disabled: isSelf }, Validators.required],
        }),
      );
    });
  }

  private handleSubmitError(error: unknown, isUpdate: boolean): void {
    this.isSubmitting = false;

    const fieldErrors = fieldErrorsOf(error);
    if (Object.keys(fieldErrors).length > 0) {
      this.fieldErrors = fieldErrors;
      return;
    }

    const key = errorKeyOf(error) ?? (isUpdate ? 'Project.updateError' : 'Project.addError');
    this.notificationService.showNotification(this.translateService.instant(key), ToastTypeEnum.Error);
  }
}
