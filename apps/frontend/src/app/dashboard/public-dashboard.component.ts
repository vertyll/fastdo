import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-public-dashboard',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="text-center">
      <h2 class="text-2xl font-bold">{{ 'Dashboard.title' | translate }}</h2>
    </div>
  `,
})
export class PublicDashboardComponent {}
