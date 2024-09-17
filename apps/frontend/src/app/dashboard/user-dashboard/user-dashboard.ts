import { Component } from '@angular/core';

@Component({
  selector: 'app-user-dashboard',
  template: `
    <div class="text-center">
      <h2 class="text-2xl font-bold">Twój Dashboard</h2>
      <p class="mt-4">Zarządzaj swoimi zadaniami i projektami.</p>
      <a
        routerLink="/tasks"
        class="mt-4 inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >Zobacz zadania</a
      >
      <a
        routerLink="/projects"
        class="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >Zobacz projekty</a
      >
    </div>
  `,
})
export class UserDashboardComponent {}
