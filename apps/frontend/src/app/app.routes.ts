import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { ProjectRolePermissionGuard } from './core/guards/project-role-permission.guard';
import { ProjectRolePermissionEnum } from './shared/enums/project-role-permission.enum';
import { TaskPermissionEnum } from './shared/enums/task-permission.enum';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    title: 'PageTitles.home',
    pathMatch: 'full',
    canActivate: [guestGuard],
  },
  {
    path: 'terms',
    title: 'PageTitles.terms',
    loadComponent: () => import('./terms-and-policies/terms.page.component').then(m => m.TermsPageComponent),
  },
  {
    path: 'privacy-policy',
    title: 'PageTitles.privacyPolicy',
    loadComponent: () =>
      import('./terms-and-policies/privacy-policy.page.component').then(m => m.PrivacyPolicyPageComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'PageTitles.dashboard',
    canActivate: [authGuard],
  },
  {
    path: 'projects',
    title: 'PageTitles.projects',
    children: [
      {
        path: '',
        loadComponent: () => import('./project/project-list.page.component').then(m => m.ProjectListPageComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./project/project-form.page.component').then(m => m.ProjectFormPageComponent),
        title: 'PageTitles.newProject',
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./project/project-form.page.component').then(m => m.ProjectFormPageComponent),
        title: 'PageTitles.editProject',
        canActivate: [ProjectRolePermissionGuard],
        data: { requiredPermission: ProjectRolePermissionEnum.EDIT_PROJECT },
      },
      {
        path: ':id/tasks',
        loadComponent: () => import('./task/task-list.page.component').then(m => m.TaskListPageComponent),
        title: 'PageTitles.projectTasks',
        canActivate: [ProjectRolePermissionGuard],
        data: { requiredPermission: TaskPermissionEnum.VIEW_TASKS },
      },
      {
        path: ':id/tasks/new',
        loadComponent: () => import('./task/task-form.page.component').then(m => m.TaskFormPageComponent),
        title: 'PageTitles.newTask',
      },
      {
        path: ':id/tasks/details/:taskId',
        loadComponent: () => import('./task/task-details.page.component').then(m => m.TaskDetailsPageComponent),
        title: 'PageTitles.taskDetails',
      },
      {
        path: ':id/tasks/edit/:taskId',
        loadComponent: () => import('./task/task-form.page.component').then(m => m.TaskFormPageComponent),
        title: 'PageTitles.editTask',
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'user-profile',
    title: 'PageTitles.userProfile',
    loadComponent: () => import('./user/user-profile.component').then(m => m.UserProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'notification-settings',
    title: 'PageTitles.notificationSettings',
    loadComponent: () =>
      import('./shared/components/organisms/notification-settings.component').then(
        m => m.NotificationSettingsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin/translations',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./admin/translations.page.component').then(m => m.TranslationsPageComponent),
  },
  {
    path: 'admin/roles',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./admin/roles.page.component').then(m => m.RolesPageComponent),
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./admin/users.page.component').then(m => m.UsersPageComponent),
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
