import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './auth/forgot-password.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { ResetPasswordComponent } from './auth/reset-password.component';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ProjectFormPageComponent } from './project/project-form.page.component';
import { ProjectListPageComponent } from './project/project-list.page.component';
import { NotificationSettingsComponent } from './shared/components/organisms/notification-settings.component';
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
    title: 'Home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    title: 'Logowanie',
    component: LoginComponent,
  },
  {
    path: 'register',
    title: 'Rejestracja',
    component: RegisterComponent,
  },
  {
    path: 'forgot-password',
    title: 'Zapomniałem hasła',
    component: ForgotPasswordComponent,
  },
  {
    path: 'reset-password',
    title: 'Resetowanie hasła',
    component: ResetPasswordComponent,
  },
  {
    path: 'terms',
    title: 'Regulamin',
    component: TermsPageComponent,
  },
  {
    path: 'privacy-policy',
    title: 'Polityka prywatności',
    component: PrivacyPolicyPageComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard',
    canActivate: [AuthGuard],
  },
  {
    path: 'projects',
    title: 'Projekty',
    children: [
      {
        path: '',
        component: ProjectListPageComponent,
      },
      {
        path: 'new',
        component: ProjectFormPageComponent,
        title: 'Nowy projekt',
      },
      {
        path: 'edit/:id',
        component: ProjectFormPageComponent,
        title: 'Edytuj projekt',
      },
      {
        path: ':id/tasks',
        component: TaskListPageComponent,
        title: 'Zadania projektu',
      },
      {
        path: ':id/tasks/new',
        component: TaskFormPageComponent,
        title: 'Nowe zadanie',
      },
      {
        path: ':id/tasks/details/:taskId',
        component: TaskDetailsPageComponent,
        title: 'Szczegóły zadania',
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'user-profile',
    title: 'Profil użytkownika',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'notification-settings',
    title: 'Ustawienia powiadomień',
    component: NotificationSettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
