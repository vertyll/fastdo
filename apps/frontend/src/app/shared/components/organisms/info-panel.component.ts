import { Component, ElementRef, effect, input, signal, viewChild } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroArrowRight, heroChevronUp, heroEllipsisHorizontal } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-info-panel',
  imports: [NgIconComponent, TranslateModule],
  providers: [
    provideIcons({
      heroArrowLeft,
      heroArrowRight,
      heroEllipsisHorizontal,
      heroChevronUp,
    }),
  ],
  template: `
    @if (isLoggedIn()()) {
      <div>
        <div
          class="fixed bottom-0 right-0 bg-primary-500 hover:bg-primary-600 border border-neutral-900 text-white p-2 cursor-pointer flex items-center justify-center z-[500] w-10 h-10 user-select-none"
          (click)="togglePanel()()"
          (keydown.enter)="togglePanel()()"
          (keydown.space)="togglePanel()(); $event.preventDefault()"
          role="button"
          tabindex="0"
          [attr.aria-label]="
            panelOpen() ? ('InfoPanel.closeInfoPanel' | translate) : ('InfoPanel.openInfoPanel' | translate)
          "
        >
          @if (!panelOpen()) {
            <ng-icon name="heroArrowLeft"></ng-icon>
          } @else {
            <ng-icon name="heroArrowRight"></ng-icon>
          }
        </div>

        <div
          class="info-panel-container fixed bottom-0 right-0 bg-neutral-300 dark:bg-neutral-600 border border-neutral-900 text-text-primary dark:text-dark-text-primary px-4 transition-transform transform w-full h-10 duration-300 ease-in-out flex items-center flex-nowrap gap-6 overflow-x-auto pr-14 z-[499]"
          [class.translate-x-0]="panelOpen()"
          [class.translate-x-full]="!panelOpen()"
        >
          <div #rolesSection class="flex items-center min-w-fit gap-1">
            <b class="whitespace-nowrap">{{ 'InfoPanel.userRoles' | translate }}:</b>
            @if (expandedSection() === 'roles') {
              <span class="dark:text-secondary-500 text-primary-500 whitespace-nowrap ml-1">
                {{ userRolesString() }}
              </span>
              <button
                class="flex items-center justify-center p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                (click)="toggleSection('')"
              >
                <ng-icon name="heroChevronUp" class="text-sm"></ng-icon>
              </button>
            } @else {
              <span class="dark:text-secondary-500 text-primary-500 truncate max-w-40 ml-1">
                {{ userRolesString() }}
              </span>
              @if (userRolesString().length > maxVisibleChars) {
                <button
                  class="flex items-center justify-center p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                  (click)="toggleSection('roles')"
                >
                  <ng-icon name="heroEllipsisHorizontal" class="text-sm"></ng-icon>
                </button>
              }
            }
          </div>

          <div #timeSection class="flex items-center min-w-fit gap-1">
            <b class="whitespace-nowrap">{{ 'InfoPanel.currentTime' | translate }}:</b>
            @if (expandedSection() === 'time') {
              <span class="dark:text-green-500 text-orange-500 whitespace-nowrap ml-1">
                {{ currentTime() }}
              </span>
              <button
                class="flex items-center justify-center p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                (click)="toggleSection('')"
              >
                <ng-icon name="heroChevronUp" class="text-sm"></ng-icon>
              </button>
            } @else {
              <span class="dark:text-green-500 text-orange-500 truncate max-w-40 ml-1">
                {{ currentTime() }}
              </span>
              @if (currentTime().length > maxVisibleChars) {
                <button
                  class="flex items-center justify-center p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                  (click)="toggleSection('time')"
                >
                  <ng-icon name="heroEllipsisHorizontal" class="text-sm"></ng-icon>
                </button>
              }
            }
          </div>

          <div #browserSection class="flex items-center min-w-fit gap-1">
            <b class="whitespace-nowrap">{{ 'InfoPanel.browserInfo' | translate }}:</b>
            @if (expandedSection() === 'browser') {
              <span class="dark:text-secondary-500 text-primary-500 whitespace-nowrap ml-1">
                {{ browserInfo() }}
              </span>
              <button
                class="flex items-center justify-center p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                (click)="toggleSection('')"
              >
                <ng-icon name="heroChevronUp" class="text-sm"></ng-icon>
              </button>
            } @else {
              <span class="dark:text-secondary-500 text-primary-500 truncate max-w-40 ml-1">
                {{ browserInfo() }}
              </span>
              @if (browserInfo().length > maxVisibleChars) {
                <button
                  class="flex items-center justify-center p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                  (click)="toggleSection('browser')"
                >
                  <ng-icon name="heroEllipsisHorizontal" class="text-sm"></ng-icon>
                </button>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .info-panel-container::-webkit-scrollbar {
          height: 6px;
        }
        .info-panel-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .info-panel-container::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .dark .info-panel-container::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    `,
  ],
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

  private readonly rolesSection = viewChild<ElementRef>('rolesSection');
  private readonly timeSection = viewChild<ElementRef>('timeSection');
  private readonly browserSection = viewChild<ElementRef>('browserSection');

  constructor() {
    effect(() => {
      const sectionName = this.expandedSection();
      if (sectionName) {
        setTimeout(() => this.scrollToSection(sectionName), 50);
      }
    });
  }

  protected toggleSection(section: string): void {
    this.expandedSection.set(this.expandedSection() === section ? '' : section);
  }

  private scrollToSection(sectionName: string): void {
    const sectionMap = {
      roles: this.rolesSection,
      time: this.timeSection,
      browser: this.browserSection,
    };

    const sectionSignal = sectionMap[sectionName as keyof typeof sectionMap];
    const element = sectionSignal()?.nativeElement;

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
    }
  }
}
