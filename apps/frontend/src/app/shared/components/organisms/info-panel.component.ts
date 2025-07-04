import { Component, input, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroArrowRight, heroChevronUp, heroEllipsisHorizontal } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-info-panel',
  imports: [NgIconComponent, TranslateModule],
  providers: [provideIcons({
    heroArrowLeft,
    heroArrowRight,
    heroEllipsisHorizontal,
    heroChevronUp,
  })],
  template: `
    @if (isLoggedIn()()) {
      <div>
        <div
          class="fixed bottom-0 right-0 bg-primary-500 hover:bg-primary-600 border border-neutral-900 text-white p-2 cursor-pointer flex items-center justify-center z-10 w-10 h-10 user-select-none"
          (click)="togglePanel()()"
        >
          @if (!panelOpen()) {
            <ng-icon name="heroArrowLeft"></ng-icon>
          } @else {
            <ng-icon name="heroArrowRight"></ng-icon>
          }
        </div>
        <div
          class="fixed bottom-0 right-0 bg-neutral-300 dark:bg-neutral-600 border border-neutral-900 text-text-primary dark:text-dark-text-primary p-4 transition-transform transform w-[calc(100%)] h-10 duration-300 ease-in-out flex items-center gap-6 overflow-x-auto pr-8"
          [class.translate-x-0]="panelOpen()"
          [class.translate-x-full]="!panelOpen()"
        >
          <div class="flex items-center min-w-fit">
            <b>{{ 'InfoPanel.userRoles' | translate }}</b>:
            @if (expandedSection() === 'roles') {
              <span class="dark:text-secondary-500 text-primary-500 ml-2 break-all">
                @if (userRolesString().length > maxVisibleChars) {
                  <button
                    class="mr-1 p-1 text-white hover:bg-neutral-700 rounded"
                    (click)="toggleSection('')"
                  >
                    <ng-icon name="heroChevronUp" class="text-sm"></ng-icon>
                  </button>
                }
                {{ userRolesString() }}
              </span>
            } @else {
              <span class="dark:text-secondary-500 text-primary-500 ml-2 truncate max-w-[100px]">
                {{ userRolesString() }}
              </span>
              @if (userRolesString().length > maxVisibleChars) {
                <button class="ml-2 text-white hover:bg-gray-700 rounded" (click)="toggleSection('roles')">
                  <ng-icon name="heroEllipsisHorizontal" class="text-sm"></ng-icon>
                </button>
              }
            }
          </div>

          <div class="flex items-center min-w-fit">
            <b>{{ 'InfoPanel.currentTime' | translate }}</b>:
            @if (expandedSection() === 'time') {
              <span class="dark:text-green-500 text-orange-500 ml-2 break-all">
                @if (currentTime().length > maxVisibleChars) {
                  <button
                    class="mr-1 p-1 text-white hover:bg-gray-700 rounded"
                    (click)="toggleSection('')"
                  >
                    <ng-icon name="heroChevronUp" class="text-sm"></ng-icon>
                  </button>
                }
                {{ currentTime() }}
              </span>
            } @else {
              <span class="dark:text-secondary-500 text-primary-500 ml-2 truncate max-w-[100px]">
                {{ currentTime() }}
              </span>
              @if (currentTime().length > maxVisibleChars) {
                <button class="ml-2 text-white hover:bg-neutral-700 rounded" (click)="toggleSection('time')">
                  <ng-icon name="heroEllipsisHorizontal" class="text-sm"></ng-icon>
                </button>
              }
            }
          </div>

          <div class="flex items-center min-w-fit">
            <b>{{ 'InfoPanel.browserInfo' | translate }}</b>:
            @if (expandedSection() === 'browser') {
              <span class="dark:text-secondary-500 text-primary-500 ml-2 break-all">
                @if (browserInfo().length > maxVisibleChars) {
                  <button
                    class="mr-1 p-1 text-white hover:bg-neutral-700 rounded"
                    (click)="toggleSection('')"
                  >
                    <ng-icon name="heroChevronUp" class="text-sm"></ng-icon>
                  </button>
                }
                {{ browserInfo() }}
              </span>
            } @else {
              <span class="dark:text-secondary-500 ml-2 truncate max-w-[100px] text-primary-500">
                {{ browserInfo() }}
              </span>
              @if (browserInfo().length > maxVisibleChars) {
                <button class="ml-2" (click)="toggleSection('browser')">
                  <ng-icon name="heroEllipsisHorizontal" class="text-sm"></ng-icon>
                </button>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  `],
})
export class InfoPanelComponent {
  readonly panelOpen = input<boolean>(false);
  readonly togglePanel = input.required<() => void>();
  readonly userRolesString = input<string>('');
  readonly currentTime = input<string>('');
  readonly browserInfo = input<string>('');
  readonly isLoggedIn = input.required<() => boolean>();

  protected readonly maxVisibleChars = 20;
  protected expandedSection = signal<string>('');

  protected toggleSection(section: string): void {
    this.expandedSection.set(this.expandedSection() === section ? '' : section);
  }
}
