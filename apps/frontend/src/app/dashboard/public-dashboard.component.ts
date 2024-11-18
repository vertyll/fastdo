import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../shared/components/atoms/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-dashboard',
  standalone: true,
  imports: [TranslateModule, ButtonComponent],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-start p-4">
      <div
        class="bg-white shadow-lg border rounded-lg p-6 max-w-4xl w-full mt-10"
      >
        <h2 class="text-4xl font-bold text-center text-orange-500 mb-6">
          {{ 'Dashboard.title' | translate }}
        </h2>
        <p class="text-lg text-gray-700 text-center mb-4">
          {{ 'Dashboard.description' | translate }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-orange-100 p-4 rounded-lg shadow-md">
            <h3 class="text-2xl font-semibold text-orange-600 mb-2">
              {{ 'Dashboard.feature1Title' | translate }}
            </h3>
            <p class="text-gray-600">
              {{ 'Dashboard.feature1Description' | translate }}
            </p>
          </div>
          <div class="bg-orange-100 p-4 rounded-lg shadow-md">
            <h3 class="text-2xl font-semibold text-orange-600 mb-2">
              {{ 'Dashboard.feature2Title' | translate }}
            </h3>
            <p class="text-gray-600">
              {{ 'Dashboard.feature2Description' | translate }}
            </p>
          </div>
        </div>
        <div class="text-center mb-6">
          <app-button (click)="navigateToSignup()">
            {{ 'Dashboard.signup' | translate }}
          </app-button>
        </div>
        <div class="bg-gray-200 p-4 rounded-lg shadow-md">
          <h3 class="text-2xl font-semibold text-gray-800 mb-2">
            {{ 'Dashboard.additionalInfoTitle' | translate }}
          </h3>
          <p class="text-gray-600">
            {{ 'Dashboard.additionalInfoDescription' | translate }}
          </p>
        </div>
      </div>
    </div>
  `,
})
export class PublicDashboardComponent {
  private readonly router = inject(Router);

  protected navigateToSignup() {
    this.router.navigate(['/register']);
  }
}
