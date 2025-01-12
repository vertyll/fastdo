import { Routes } from '@angular/router';
import { ProjectListPageComponent } from './project/project-list.page.component';
import { TaskListPageComponent } from './task/task-list.page.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {HomeComponent} from "./home/home.component";

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
    canActivate: [AuthGuard]
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
