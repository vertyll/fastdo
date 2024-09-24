import { Routes } from '@angular/router';
import { ProjectListPageComponent } from './project/project-list/project-list.page.component';
import { TaskListPageComponent } from './task/task-list/task-list.page.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PublicDashboardComponent } from './dashboard/public-dashboard/public-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicDashboardComponent,
    title: 'Dashboard',
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
    path: '**',
    redirectTo: 'tasks',
  },
];
