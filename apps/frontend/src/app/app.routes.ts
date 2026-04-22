import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './auth/forgot-password.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { ResetPasswordComponent } from './auth/reset-password.component';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { ProjectRolePermissionGuard } from './core/guards/project-role-permission.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ProjectFormPageComponent } from './project/project-form.page.component';
import { ProjectListPageComponent } from './project/project-list.page.component';
import { NotificationSettingsComponent } from './shared/components/organisms/notification-settings.component';
import { ProjectRolePermissionEnum } from './shared/enums/project-role-permission.enum';
import { TaskDetailsPageComponent } from './task/task-details.page.component';
import { TaskFormPageComponent } from './task/task-form.page.component';
import { TaskListPageComponent } from './task/task-list.page.component';
import { PrivacyPolicyPageComponent } from './terms-and-policies/privacy-policy.page.component';
import { TermsPageComponent } from './terms-and-policies/terms.page.component';
import { UserProfileComponent } from './user/user-profile.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'PageTitles.home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    title: 'PageTitles.login',
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'register',
    title: 'PageTitles.register',
    component: RegisterComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'forgot-password',
    title: 'PageTitles.forgotPassword',
    component: ForgotPasswordComponent,
  },
  {
    path: 'reset-password',
    title: 'PageTitles.resetPassword',
    component: ResetPasswordComponent,
  },
  {
    path: 'terms',
    title: 'PageTitles.terms',
    component: TermsPageComponent,
  },
  {
    path: 'privacy-policy',
    title: 'PageTitles.privacyPolicy',
    component: PrivacyPolicyPageComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'PageTitles.dashboard',
    canActivate: [AuthGuard],
  },
  {
    path: 'projects',
    title: 'PageTitles.projects',
    children: [
      {
        path: '',
        component: ProjectListPageComponent,
      },
      {
        path: 'new',
        component: ProjectFormPageComponent,
        title: 'PageTitles.newProject',
      },
      {
        path: 'edit/:id',
        component: ProjectFormPageComponent,
        title: 'PageTitles.editProject',
        canActivate: [ProjectRolePermissionGuard],
        data: { requiredPermission: ProjectRolePermissionEnum.EDIT_PROJECT },
      },
      {
        path: ':id/tasks',
        component: TaskListPageComponent,
        title: 'PageTitles.projectTasks',
        canActivate: [ProjectRolePermissionGuard],
        data: { requiredPermission: ProjectRolePermissionEnum.SHOW_TASKS },
      },
      {
        path: ':id/tasks/new',
        component: TaskFormPageComponent,
        title: 'PageTitles.newTask',
      },
      {
        path: ':id/tasks/details/:taskId',
        component: TaskDetailsPageComponent,
        title: 'PageTitles.taskDetails',
      },
      {
        path: ':id/tasks/edit/:taskId',
        component: TaskFormPageComponent,
        title: 'PageTitles.editTask',
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'user-profile',
    title: 'PageTitles.userProfile',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'notification-settings',
    title: 'PageTitles.notificationSettings',
    component: NotificationSettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
