import { Routes } from '@angular/router';
import { ProjectListPageComponent } from './project/project-list/project-list.page.component';
import { TaskListPageComponent } from './task/task-list/task-list.page.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './core/guards/auth.guard';
import { UserDashboardComponent } from './dashboard/user-dashboard/user-dashboard';
import { PublicDashboardComponent } from './dashboard/public-dashboard/public-dashboard';

export const routes: Routes = [
  {
    path: '',
    component: PublicDashboardComponent,
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'dashboard',
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
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
