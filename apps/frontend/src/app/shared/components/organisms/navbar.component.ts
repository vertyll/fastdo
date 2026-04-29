import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, input, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBars4,
  heroBell,
  heroChevronDown,
  heroChevronUp,
  heroClipboardDocumentList,
  heroExclamationCircle,
  heroListBullet,
  heroSquares2x2,
  heroUserCircle,
  heroArrowRightOnRectangle,
} from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, filter } from 'rxjs';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { NotificationStateService } from '../../services/notification-state.service';
import { NavModule, NavSection } from '../../defs/config.defs';
import { ThemeSwitcherComponent } from '../atoms/theme-switcher.component';
import { ToastComponent } from '../atoms/toast.component';
import { NotificationDropdownComponent } from './notification-dropdown.component';
import { ButtonComponent } from '../atoms/button.component';
import { DropdownComponent, DropdownMenuDirective } from '../atoms/dropdown.component';
import { configNavModules } from 'src/app/config/config.nav.modules';

@Component({
  selector: 'app-navbar',
  imports: [
    NgIconComponent,
    TranslateModule,
    CommonModule,
    RouterOutlet,
    ThemeSwitcherComponent,
    ToastComponent,
    NotificationDropdownComponent,
    ButtonComponent,
    DropdownComponent,
    DropdownMenuDirective,
  ],
  viewProviders: [
    provideIcons({
      heroClipboardDocumentList,
      heroListBullet,
      heroExclamationCircle,
      heroSquares2x2,
      heroUserCircle,
      heroBars4,
      heroChevronDown,
      heroChevronUp,
      heroBell,
      heroArrowRightOnRectangle,
    }),
  ],
  styles: [
    `
      @reference "../../../../style.css";

      /* ── Animation keyframes ── */
      @keyframes dropdown-enter {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes dropdown-leave {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-10px);
        }
      }

      /* ── Component styles ── */
      .top-nav {
        @apply h-16 bg-background-primary dark:bg-dark-background-primary border-b border-border-primary dark:border-dark-border-primary z-50 px-2.5 transition-colors duration-200;
      }

      .nav-content {
        @apply h-full mx-auto flex items-center justify-between;
      }

      .modules-container {
        @apply hidden md:flex space-x-4;
      }

      .module-item {
        @apply flex items-center space-x-2 px-3.5 py-1 rounded-md cursor-pointer hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200 dark:text-dark-text-primary;
      }

      .module-item.active {
        @apply bg-primary-50 dark:bg-primary-900/50 text-primary-500 dark:text-primary-400 transition-colors duration-200;
      }

      .auth-section {
        @apply md:flex items-center hidden;
      }

      .auth-button {
        @apply px-3 py-1.5 rounded-md transition-colors duration-200 text-sm font-medium;
      }

      .menu-button {
        @apply flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-sm font-medium text-text-primary dark:text-dark-text-primary relative transition-colors duration-200;
      }

      .mobile-module-item {
        @apply flex items-center space-x-2 px-3 py-2 hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200 text-sm cursor-pointer;
      }

      .mobile-module-item.active {
        @apply bg-primary-50 dark:bg-primary-900/50 text-primary-500 dark:text-primary-400 transition-colors duration-200;
      }

      .side-nav {
        @apply hidden md:block w-24 bg-surface-primary dark:bg-dark-surface-primary fixed left-0 top-16 bottom-0 border-r border-border-primary dark:border-dark-border-primary transition-colors duration-200;
      }

      .side-nav-content {
        @apply h-full flex flex-col items-center justify-start py-8 space-y-4;
      }

      .mobile-sections {
        @apply md:hidden bg-background-primary dark:bg-dark-background-primary border-b border-border-primary dark:border-dark-border-primary transition-colors duration-200;
      }

      .mobile-section-item {
        @apply flex items-center space-x-3 px-4 py-2.5 cursor-pointer hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200 dark:text-dark-text-primary;
      }

      .mobile-section-item.active {
        @apply bg-primary-50 dark:bg-primary-900/50 text-primary-500 dark:text-primary-400 transition-colors duration-200;
      }

      .mobile-section-icon {
        @apply text-base;
      }

      .mobile-section-text {
        @apply text-sm;
      }

      .show-more-button {
        @apply w-full flex items-center justify-center py-2 text-xs text-text-primary dark:text-dark-text-primary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200;
      }

      .section-item {
        @apply flex flex-col items-center justify-center w-20 py-2 cursor-pointer rounded-xl relative transition-all duration-200 hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary dark:text-dark-text-primary transition-colors duration-200;
      }

      .section-item.active {
        @apply bg-primary-50 dark:bg-primary-900/50 text-primary-500 dark:text-primary-400 transition-colors duration-200;
      }

      .section-icon {
        @apply mb-2;
      }

      .section-title {
        @apply text-xs font-medium text-center;
      }

      .counter-badge {
        @apply absolute -top-1 -right-1 bg-primary-500 dark:bg-primary-600 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 transition-colors duration-200;
      }

      .main-content.authenticated {
        @apply md:ml-24;
      }

      .content-wrapper {
        @apply mx-auto p-6 md:px-8;
      }

      .public-nav {
        @apply flex justify-between items-center h-full mx-auto px-4 md:px-8;
      }

      .app-logo {
        @apply text-lg md:text-xl font-bold text-text-primary dark:text-dark-text-primary transition-colors duration-200;
      }

      .language-button {
        @apply flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-sm font-medium text-text-primary dark:text-dark-text-primary transition-colors duration-200 relative;
      }

      .profile-button {
        @apply flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-sm font-medium text-text-primary dark:text-dark-text-primary transition-colors duration-200 relative;
      }

      .language-option {
        @apply block px-4 py-2 text-left text-sm text-text-primary dark:text-dark-text-primary hover:bg-background-secondary dark:hover:bg-dark-background-secondary;
      }

      .language-option.active {
        @apply text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/50 transition-colors duration-200;
      }

      @media (max-width: 768px) {
        .relative.flex.flex-row {
          align-items: center;
          gap: 0;
        }

        app-notification-dropdown button,
        app-theme-switcher button {
          padding: 0.5rem;
          height: 2.5rem;
          width: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    `,
  ],
  template: `
    @if (!authService.isLoggedIn()) {
      <nav class="top-nav">
        <div class="public-nav">
          <span
            class="app-logo cursor-pointer"
            (click)="navigateToHomePage()"
            (keydown.enter)="navigateToHomePage()"
            (keydown.space)="navigateToHomePage(); $event.preventDefault()"
            role="button"
            tabindex="0"
            [attr.aria-label]="'Navbar.home' | translate"
          >
            {{ 'Basic.appName' | translate }}
          </span>
          <div class="flex items-center space-x-4">
            <app-theme-switcher />
            <app-dropdown [closeSignal]="closeNotificationDropdown()">
              <button class="language-button" dropdownTrigger>
                <span>{{ getCurrentLanguage() }}</span>
                <ng-icon name="heroChevronDown" size="16"></ng-icon>
              </button>

              <ng-container *appDropdownMenu>
                @for (lang of languages; track lang) {
                  <button
                    class="language-option"
                    [class.active]="getCurrentLanguage() === lang.toUpperCase()"
                    (click)="selectLanguage(lang)"
                  >
                    {{ lang.toUpperCase() }}
                  </button>
                }
              </ng-container>
            </app-dropdown>

            <div class="auth-section">
              <app-button class="auth-button" (click)="router.navigate(['/login'])">
                {{ 'Basic.login' | translate }}
              </app-button>
              <app-button class="auth-button" (click)="router.navigate(['/register'])">
                {{ 'Basic.register' | translate }}
              </app-button>
            </div>

            <div class="md:hidden">
              <app-dropdown [closeSignal]="closeNotificationDropdown()">
                <button class="menu-button" dropdownTrigger aria-label="Toggle menu">
                  <ng-icon name="heroBars4" size="24"></ng-icon>
                </button>
                <ng-container *appDropdownMenu>
                  <button class="mobile-module-item text-left" (click)="navigateToLoginPage()">
                    {{ 'Basic.login' | translate }}
                  </button>
                  <button class="mobile-module-item text-left" (click)="navigateToRegisterPage()">
                    {{ 'Basic.register' | translate }}
                  </button>
                </ng-container>
              </app-dropdown>
            </div>
          </div>
        </div>
      </nav>
    } @else {
      <nav class="top-nav">
        <div class="nav-content">
          <div class="modules-container">
            @for (module of modules(); track module.id) {
              <div
                class="module-item"
                [class.active]="currentModule() === module.id"
                (click)="selectModule(module)"
                (keydown.enter)="selectModule(module)"
                (keydown.space)="selectModule(module); $event.preventDefault()"
                role="button"
                tabindex="0"
                [attr.aria-label]="module.title | translate"
              >
                <ng-icon [name]="module.icon" size="24"></ng-icon>
                <span class="font-medium">{{ module.title | translate }}</span>
              </div>
            }
          </div>

          <div class="hidden md:flex items-center space-x-4">
            <app-dropdown [closeSignal]="closeNotificationDropdown()">
              <button class="profile-button gap-1" dropdownTrigger>
                <span>Menu</span>
                <ng-icon name="heroChevronDown" size="16"></ng-icon>
              </button>

              <ng-container *appDropdownMenu>
                <button
                  class="auth-button text-left flex items-center gap-2 hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary hover:text-link-hover dark:hover:text-link-dark-hover"
                  (click)="navigateToProfile()"
                >
                  <ng-icon name="heroUserCircle" size="16"></ng-icon>
                  <span>
                    {{ 'Navbar.profile' | translate }}
                  </span>
                </button>
                <button
                  class="auth-button text-left flex items-center gap-2 hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300"
                  (click)="logout()"
                >
                  <ng-icon name="heroArrowRightOnRectangle" size="16"></ng-icon>
                  <span>
                    {{ 'Basic.logout' | translate }}
                  </span>
                </button>
              </ng-container>
            </app-dropdown>
            <app-notification-dropdown
              [isMobileContext]="false"
              [isMobileMenuOpen]="false"
              [closeSignal]="closeNotificationDropdown()"
            />
            <app-theme-switcher />
            <app-dropdown [closeSignal]="closeNotificationDropdown()">
              <button class="language-button" dropdownTrigger>
                <span>{{ getCurrentLanguage() }}</span>
                <ng-icon name="heroChevronDown" size="16"></ng-icon>
              </button>

              <ng-container *appDropdownMenu>
                @for (lang of languages; track lang) {
                  <button
                    class="language-option"
                    [class.active]="getCurrentLanguage() === lang.toUpperCase()"
                    (click)="selectLanguage(lang)"
                  >
                    {{ lang.toUpperCase() }}
                  </button>
                }
              </ng-container>
            </app-dropdown>
          </div>

          <div class="flex md:hidden w-full justify-between">
            <app-dropdown [closeSignal]="closeNotificationDropdown()">
              <button class="menu-button" dropdownTrigger>
                <span>Menu</span>
                <ng-icon name="heroChevronDown" size="16"></ng-icon>
              </button>

              <ng-container *appDropdownMenu>
                @for (module of modules(); track module.id) {
                  <div
                    class="mobile-module-item"
                    [class.active]="currentModule() === module.id"
                    (click)="selectModule(module)"
                    (keydown.enter)="selectModule(module)"
                    (keydown.space)="selectModule(module); $event.preventDefault()"
                    role="button"
                    tabindex="0"
                    [attr.aria-label]="module.title | translate"
                  >
                    <ng-icon [name]="module.icon" size="20"></ng-icon>
                    <span>{{ module.title | translate }}</span>
                  </div>
                }
                <div class="border-t border-border-primary dark:border-dark-border-primary mt-1">
                  <button
                    (click)="navigateToProfile()"
                    class="mobile-module-item text-text-primary dark:text-dark-text-primary hover:text-text-primary dark:hover:text-dark-text-primary w-full text-left flex items-center"
                  >
                    <ng-icon name="heroUserCircle" size="16"></ng-icon>
                    <span>{{ 'Navbar.profile' | translate }}</span>
                  </button>
                  <button
                    (click)="navigateToNotificationSettings()"
                    class="mobile-module-item text-text-primary dark:text-dark-text-primary hover:text-text-primary dark:hover:text-dark-text-primary w-full text-left flex items-center"
                  >
                    <div class="flex items-center justify-between w-full">
                      <div class="flex items-center space-x-2">
                        <ng-icon name="heroBell" size="16"></ng-icon>
                        <span>{{ 'Notifications.title' | translate }}</span>
                      </div>
                      @if (unreadNotificationCount() > 0) {
                        <span class="counter-badge">
                          {{ unreadNotificationCount() > 99 ? '99+' : unreadNotificationCount() }}
                        </span>
                      }
                    </div>
                  </button>
                  <button
                    (click)="logout()"
                    class="mobile-module-item text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300 w-full text-left flex items-center"
                  >
                    <ng-icon name="heroArrowRightOnRectangle" size="16"></ng-icon>
                    <span>{{ 'Basic.logout' | translate }}</span>
                  </button>
                </div>
              </ng-container>
            </app-dropdown>

            <div class="relative flex flex-row items-center space-x-1">
              <app-notification-dropdown
                [isMobileContext]="true"
                [isMobileMenuOpen]="false"
                [closeSignal]="closeNotificationDropdown()"
              />
              <app-theme-switcher />
              <app-dropdown [closeSignal]="closeNotificationDropdown()">
                <button class="menu-button" dropdownTrigger>
                  <span>{{ getCurrentLanguage() }}</span>
                  <ng-icon name="heroChevronDown" size="16"></ng-icon>
                </button>

                <ng-container *appDropdownMenu>
                  @for (lang of languages; track lang) {
                    <button
                      class="mobile-module-item text-left"
                      [class.active]="getCurrentLanguage() === lang.toUpperCase()"
                      (click)="selectLanguage(lang)"
                    >
                      {{ lang.toUpperCase() }}
                    </button>
                  }
                </ng-container>
              </app-dropdown>
            </div>
          </div>
        </div>
      </nav>

      <nav class="side-nav">
        <div class="side-nav-content">
          @for (section of sections(); track section.id) {
            <div
              class="section-item"
              [class.active]="currentSection() === section.id"
              (click)="selectSection(section)"
              (keydown.enter)="selectSection(section)"
              (keydown.space)="selectSection(section); $event.preventDefault()"
              role="button"
              tabindex="0"
              [attr.aria-label]="section.title | translate"
            >
              <div class="relative">
                <ng-icon [name]="section.icon" size="24" class="section-icon"></ng-icon>
              </div>
              <span class="section-title">{{ section.title | translate }}</span>
            </div>
          }
        </div>
      </nav>

      <div class="mobile-sections">
        @for (section of visibleSections(); track section.id) {
          <div
            class="mobile-section-item"
            [class.active]="currentSection() === section.id"
            (click)="selectSection(section)"
            (keydown.enter)="selectSection(section)"
            (keydown.space)="selectSection(section); $event.preventDefault()"
            role="button"
            tabindex="0"
            [attr.aria-label]="section.title | translate"
          >
            <div class="relative flex items-center">
              <ng-icon [name]="section.icon" size="20" class="mobile-section-icon"></ng-icon>
            </div>
            <span class="mobile-section-text">{{ section.title | translate }}</span>
          </div>
        }

        @if (sections().length > visibleItemsCount()) {
          <button class="show-more-button" (click)="toggleShowAllSections()">
            <ng-icon [name]="showAllSections ? 'heroChevronUp' : 'heroChevronDown'" size="16"></ng-icon>
            <span class="ml-1">{{
              showAllSections ? ('Basic.showLess' | translate) : ('Basic.showMore' | translate)
            }}</span>
          </button>
        }
      </div>
    }

    <div ngClass="main-content" [class.authenticated]="authService.isLoggedIn()">
      <div class="content-wrapper">
        <app-toast />
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class NavbarComponent implements OnInit, OnDestroy {
  public readonly visibleItemsCount = input<number>(2);

  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly notificationStateService = inject(NotificationStateService);

  private readonly routerSubscription: Subscription;

  private readonly defaultModules: NavModule[] = configNavModules;

  protected readonly modules = signal<NavModule[]>(this.defaultModules);
  protected readonly sections = signal<NavSection[]>([]);
  protected readonly visibleSections = signal<NavSection[]>([]);
  protected readonly currentModule = signal<string>('');
  protected readonly currentSection = signal<string>('');
  protected readonly unreadNotificationCount = this.notificationStateService.unreadCount;

  protected showAllSections: boolean = false;
  protected readonly languages: string[] = ['pl', 'en'];
  protected readonly closeNotificationDropdown = signal<number>(0);

  constructor() {
    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.initializeNavigation();
    });
  }

  ngOnInit(): void {
    this.initializeNavigation();
    this.notificationStateService.refreshNotifications();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  protected getCurrentLanguage(): string {
    return this.translateService.getCurrentLang().toUpperCase();
  }

  protected selectLanguage(lang: string): void {
    this.translateService.use(lang);
    this.localStorageService.set('selected_language', lang);
    this.closeNotificationDropdown.set(Date.now());
  }

  protected updateVisibleSections(): void {
    const allSections = this.sections();
    if (this.showAllSections || allSections.length <= this.visibleItemsCount()) {
      this.visibleSections.set(allSections);
    } else {
      this.visibleSections.set(allSections.slice(0, this.visibleItemsCount()));
    }
  }

  protected toggleShowAllSections(): void {
    this.showAllSections = !this.showAllSections;
    this.updateVisibleSections();
  }

  protected selectModule(module: NavModule): void {
    this.currentModule.set(module.id);
    this.sections.set(module.sections);
    this.showAllSections = false;
    this.updateVisibleSections();

    const defaultSection = module.sections[0];
    this.currentSection.set(defaultSection.id);

    this.router.navigate([module.route]).then();
    this.closeNotificationDropdown.set(Date.now()); // Zamknięcie dropdowna po nawigacji
  }

  protected selectSection(section: NavSection): void {
    this.currentSection.set(section.id);
    this.router.navigate([section.route]).then();
  }

  protected navigateToProfile(): void {
    this.router.navigate(['/user-profile']).then();
    this.closeNotificationDropdown.set(Date.now());
  }

  protected navigateToNotificationSettings(): void {
    this.router.navigate(['/notification-settings']).then();
    this.closeNotificationDropdown.set(Date.now());
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/']).then();
    this.closeNotificationDropdown.set(Date.now());
  }

  protected navigateToHomePage(): void {
    this.router.navigate(['/']).then();
  }

  protected navigateToLoginPage(): void {
    this.router.navigate(['/login']).then(() => this.closeNotificationDropdown.set(Date.now()));
  }

  protected navigateToRegisterPage(): void {
    this.router.navigate(['/register']).then(() => this.closeNotificationDropdown.set(Date.now()));
  }

  private initializeNavigation(): void {
    const currentUrl = this.router.url;

    const activeModule =
      this.defaultModules
        .slice()
        .reverse()
        .find(module => {
          const moduleRoute = module.route === '/' ? '/' : module.route;
          const sectionRoutes = module.sections.map(section => section.route);

          return (
            currentUrl.startsWith(moduleRoute) ||
            sectionRoutes.some(route => currentUrl.startsWith(route === '/' ? '/' : route))
          );
        }) || this.defaultModules[0];

    this.currentModule.set(activeModule.id);
    this.sections.set(activeModule.sections);
    this.updateVisibleSections();

    const activeSection = activeModule.sections
      .slice()
      .reverse()
      .find(section => {
        const sectionRoute = section.route === '/' ? '/' : section.route;
        return currentUrl.startsWith(sectionRoute);
      });

    if (activeSection) {
      this.currentSection.set(activeSection.id);
    } else {
      this.currentSection.set(activeModule.sections[0].id);
    }
  }
}
