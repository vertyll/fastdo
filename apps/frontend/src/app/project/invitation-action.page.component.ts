import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectsApiService } from './data-access/project.api.service';

@Component({
  selector: 'app-invitation-action',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 class="text-2xl font-bold mb-4">{{ message | translate }}</h2>
      @if (loading) {
        <span class="text-gray-500">{{ 'Basic.loading' | translate }}</span>
      }
      @if (!loading && !success) {
        <button class="btn btn-primary mr-2" (click)="accept()">{{ 'Basic.accept' | translate }}</button>
        <button class="btn btn-danger" (click)="reject()">{{ 'Basic.delete' | translate }}</button>
      }
      @if (success) {
        <button class="btn btn-secondary mt-4" (click)="goToProjects()">{{ 'Navbar.projects' | translate }}</button>
      }
    </div>
  `,
})
export class InvitationActionPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectApi = inject(ProjectsApiService);

  public loading = false;
  public success = false;
  public message = 'ProjectInvitation.actionPrompt';
  private invitationId: number;

  constructor() {
    this.invitationId = +this.route.snapshot.paramMap.get('id')!;
  }

  public async accept() {
    this.loading = true;
    try {
      await this.projectApi.acceptInvitation({ invitationId: this.invitationId }).toPromise();
      this.message = 'ProjectInvitation.acceptSuccess';
      this.success = true;
    } catch {
      this.message = 'ProjectInvitation.acceptError';
    } finally {
      this.loading = false;
    }
  }

  public async reject() {
    this.loading = true;
    try {
      await this.projectApi.rejectInvitation({ invitationId: this.invitationId }).toPromise();
      this.message = 'ProjectInvitation.rejectSuccess';
      this.success = true;
    } catch {
      this.message = 'ProjectInvitation.rejectError';
    } finally {
      this.loading = false;
    }
  }

  public goToProjects() {
    this.router.navigate(['/projects']);
  }
}
