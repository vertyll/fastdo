import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './auth/forgot-password.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { ResetPasswordComponent } from './auth/reset-password.component';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ProjectListPageComponent } from './project/project-list.page.component';
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
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard',
    canActivate: [AuthGuard],
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
    path: 'projects',
    component: ProjectListPageComponent,
    title: 'Projekty',
    canActivate: [AuthGuard],
  },
  {
    path: 'tasks',
    title: 'Zadania',
    children: [
      {
        path: '',
        component: TaskListPageComponent,
      },
      {
        path: 'urgent',
        data: {
          isUrgent: true,
        },
        component: TaskListPageComponent,
      },
      {
        path: ':projectId',
        component: TaskListPageComponent,
      },
    ],
    canActivate: [AuthGuard],
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
    path: 'user-profile',
    title: 'Profil użytkownika',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'tasks',
  },
];
