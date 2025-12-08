import { animate, style, transition, trigger } from '@angular/animations';
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
} from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, filter } from 'rxjs';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { configNavModules } from '../../../config/config.nav.modules';
import { LocalStorageService } from '../../services/local-storage.service';
import { NotificationStateService } from '../../services/notification-state.service';
import { NavModule, NavSection } from '../../types/config.type';
import { ThemeSwitcherComponent } from '../atoms/theme-switcher.component';
import { ToastComponent } from '../atoms/toast.component';
import { NotificationDropdownComponent } from './notification-dropdown.component';

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
    }),
  ],
  animations: [
    trigger('dropdown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
    trigger('overlay', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('hamburgerCross', [
      transition(':enter', [
        style({ transform: 'rotate(0deg)' }),
        animate('200ms ease-out', style({ transform: 'rotate(45deg)' })),
      ]),
      transition(':leave', [
        style({ transform: 'rotate(45deg)' }),
        animate('200ms ease-in', style({ transform: 'rotate(0deg)' })),
      ]),
    ]),
    trigger('mobileNavMenu', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-100%)' })),
      ]),
    ]),
  ],
  styles: [
    `
      .top-nav {
        @apply h-16 bg-background-primary dark:bg-dark-background-primary border-b border-border-primary dark:border-dark-border-primary fixed top-0 left-0 right-0 z-50 px-2.5 transition-colors duration-200;
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
        @apply md:flex items-center space-x-4 hidden;
      }

      .auth-button {
        @apply px-3 py-1.5 rounded-md transition-colors duration-200 text-sm font-medium;
      }

      .login-button {
        @apply text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/50 transition-colors duration-200 dark:hover:bg-dark-surface-secondary;
      }

      .register-button {
        @apply bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-200;
      }

      .logout-button {
        @apply text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-danger-500 dark:text-danger-400 hover:text-danger-600 dark:hover:text-danger-300 transition-colors duration-200;
      }

      .menu-button {
        @apply flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-sm font-medium text-text-primary dark:text-dark-text-primary relative transition-colors duration-200;
      }

      .menu-button.active {
        @apply bg-primary-50 dark:bg-primary-900/50 text-primary-500 dark:text-primary-400 transition-colors duration-200;
      }

      .mobile-menu {
        @apply fixed inset-0 z-50 md:hidden;
      }

      .mobile-menu-overlay {
        @apply fixed inset-0 bg-black/30;
      }

      .mobile-menu-content {
        @apply absolute w-48 bg-surface-primary dark:bg-dark-surface-primary shadow-medium rounded-md py-1 border border-border-primary dark:border-dark-border-primary transition-colors duration-200;
        position: absolute;
        top: 3.5rem;
        left: 4rem;
      }

      .mobile-menu-content.language-menu {
        @apply absolute w-24 bg-surface-primary dark:bg-dark-surface-primary shadow-medium rounded-md py-1 border border-border-primary dark:border-dark-border-primary transition-colors duration-200;
        position: absolute;
        top: 3rem;
        right: 0.5rem;
        left: auto;
        z-index: 60;
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
        @apply md:hidden bg-background-primary dark:bg-dark-background-primary border-b border-border-primary dark:border-dark-border-primary mt-16 transition-colors duration-200;
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
        @apply w-full flex items-center justify-center py-2 text-xs text-text-secondary dark:text-dark-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200;
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

      .main-content {
        @apply pt-16;
      }

      .main-content.authenticated {
        @apply pt-16 md:ml-24;
      }

      .content-wrapper {
        @apply mx-auto py-4 px-4 md:px-8;
      }

      .public-nav {
        @apply flex justify-between items-center h-full mx-auto px-4 md:px-8;
      }

      .app-logo {
        @apply text-lg md:text-xl font-bold text-text-primary dark:text-dark-text-primary transition-colors duration-200;
      }

      .language-button {
        @apply flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-sm font-medium text-text-secondary dark:text-dark-text-secondary transition-colors duration-200 relative;
      }

      .profile-button {
        @apply flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary text-sm font-medium text-text-secondary dark:text-dark-text-secondary transition-colors duration-200 relative;
      }

      .language-dropdown {
        @apply absolute right-0 top-full mt-1 w-24 bg-background-primary dark:bg-dark-background-primary shadow-lg rounded-md py-1 border border-border-primary dark:border-dark-border-primary transition-colors duration-200;
      }

      .profile-dropdown {
        @apply absolute right-0 top-full mt-1 w-24 bg-background-primary dark:bg-dark-background-primary shadow-lg rounded-md py-1 border border-border-primary dark:border-dark-border-primary transition-colors duration-200;
      }

      .language-option {
        @apply px-3 py-2 text-sm text-text-secondary dark:text-dark-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary cursor-pointer w-full text-left transition-colors duration-200;
      }

      .language-option.active {
        @apply text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/50 transition-colors duration-200;
      }

      .hamburger-icon {
        @apply md:hidden w-6 h-6 flex flex-col justify-center items-center cursor-pointer relative z-50;
      }

      .hamburger-line {
        @apply w-6 h-0.5 bg-text-secondary dark:bg-dark-text-secondary transition-all duration-300;
      }

      .hamburger-line:not(:last-child) {
        @apply mb-1.5;
      }

      .hamburger-active .hamburger-line:nth-child(1) {
        @apply transform rotate-45 translate-y-2;
      }

      .hamburger-active .hamburger-line:nth-child(2) {
        @apply opacity-0;
      }

      .hamburger-active .hamburger-line:nth-child(3) {
        @apply transform -rotate-45 -translate-y-2;
      }

      .mobile-nav-menu {
        @apply md:hidden fixed inset-0 bg-background-primary dark:bg-dark-background-primary pt-20 transition-all duration-300 z-40 flex flex-col items-center gap-2;
      }

      .mobile-nav-item {
        @apply text-center text-xl font-medium text-text-primary dark:text-dark-text-primary hover:bg-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors duration-200 py-2;
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
            <div class="relative">
              <button class="language-button" (click)="toggleLanguageDropdown($event)">
                <span>{{ getCurrentLanguage() }}</span>
                <ng-icon [name]="languageDropdownOpen ? 'heroChevronUp' : 'heroChevronDown'" size="16"></ng-icon>
              </button>

              @if (languageDropdownOpen) {
                <div class="language-dropdown" @dropdown>
                  @for (lang of languages; track lang) {
                    <button
                      class="language-option"
                      [class.active]="getCurrentLanguage() === lang.toUpperCase()"
                      (click)="selectLanguage(lang)"
                    >
                      {{ lang.toUpperCase() }}
                    </button>
                  }
                </div>
              }
            </div>
            <div class="auth-section">
              <button class="auth-button login-button" (click)="router.navigate(['/login'])">
                {{ 'Basic.login' | translate }}
              </button>
              <button class="auth-button register-button" (click)="router.navigate(['/register'])">
                {{ 'Basic.register' | translate }}
              </button>
            </div>
            <div
              class="hamburger-icon"
              [class.hamburger-active]="mobileMenuOpen"
              (click)="toggleMobileMenu()"
              (keydown.enter)="toggleMobileMenu()"
              (keydown.space)="toggleMobileMenu(); $event.preventDefault()"
              role="button"
              tabindex="0"
              [attr.aria-label]="'Navbar.toggleMenu' | translate"
            >
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </div>
          </div>
        </div>
      </nav>

      @if (mobileMenuOpen) {
        <div class="mobile-nav-menu" @mobileNavMenu>
          <button class="mobile-nav-item w-full" (click)="navigateToLoginPage()">
            {{ 'Basic.login' | translate }}
          </button>
          <button class="mobile-nav-item w-full" (click)="navigateToRegisterPage()">
            {{ 'Basic.register' | translate }}
          </button>
        </div>
      }
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
            <div class="relative">
              <button class="profile-button" (click)="toggleProfileDropdown($event)">
                <span>{{ 'Navbar.profile' | translate }}</span>
                <ng-icon [name]="profileDropdownOpen ? 'heroChevronUp' : 'heroChevronDown'" size="16"></ng-icon>
              </button>

              @if (profileDropdownOpen) {
                <div class="profile-dropdown" @dropdown>
                  <button class="auth-button" (click)="router.navigate(['/user-profile'])">
                    <span class="hover:text-link-hover dark:hover:text-link-dark-hover">
                      {{ 'Navbar.profile' | translate }}
                    </span>
                  </button>
                  <button class="auth-button" (click)="logout()">
                    <span class="hover:text-danger-600 dark:hover:text-danger-300">
                      {{ 'Basic.logout' | translate }}
                    </span>
                  </button>
                </div>
              }
            </div>
            <app-notification-dropdown [isMobileContext]="false" [isMobileMenuOpen]="false" />
            <app-theme-switcher />
            <div class="relative">
              <button class="language-button" (click)="toggleLanguageDropdown($event)">
                <span>{{ getCurrentLanguage() }}</span>
                <ng-icon [name]="languageDropdownOpen ? 'heroChevronUp' : 'heroChevronDown'" size="16"></ng-icon>
              </button>

              @if (languageDropdownOpen) {
                <div class="language-dropdown" @dropdown>
                  @for (lang of languages; track lang) {
                    <button
                      class="language-option"
                      [class.active]="getCurrentLanguage() === lang.toUpperCase()"
                      (click)="selectLanguage(lang)"
                    >
                      {{ lang.toUpperCase() }}
                    </button>
                  }
                </div>
              }
            </div>
          </div>
          <div class="flex md:hidden w-full justify-between">
            <button class="menu-button" (click)="toggleMenu()">
              <span>Menu</span>
              <ng-icon [name]="menuOpen ? 'heroChevronUp' : 'heroChevronDown'" size="16"></ng-icon>
            </button>
            <div class="relative flex flex-row items-center space-x-1">
              <app-notification-dropdown [isMobileContext]="true" [isMobileMenuOpen]="mobileMenuOpen" />
              <app-theme-switcher />
              <button class="menu-button" (click)="toggleLanguageDropdown($event)">
                <span>{{ getCurrentLanguage() }}</span>
                <ng-icon [name]="languageDropdownOpen ? 'heroChevronUp' : 'heroChevronDown'" size="16"></ng-icon>
              </button>

              @if (languageDropdownOpen) {
                <div
                  class="mobile-menu"
                  (click)="closeLanguageDropdown()"
                  (keydown.escape)="closeLanguageDropdown()"
                  role="dialog"
                  aria-modal="true"
                  tabindex="-1"
                >
                  <div class="mobile-menu-overlay" @overlay></div>
                  <div
                    class="mobile-menu-content language-menu"
                    (click)="$event.stopPropagation()"
                    (keydown.escape)="$event.stopPropagation()"
                    role="menu"
                    tabindex="-1"
                    @dropdown
                  >
                    @for (lang of languages; track lang) {
                      <button
                        class="mobile-module-item w-full text-left"
                        [class.active]="getCurrentLanguage() === lang.toUpperCase()"
                        (click)="selectLanguage(lang)"
                      >
                        {{ lang.toUpperCase() }}
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </nav>

      @if (menuOpen) {
        <div
          class="mobile-menu"
          (click)="closeMenu()"
          (keydown.escape)="closeMenu()"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
        >
          <div class="mobile-menu-overlay" @overlay></div>
          <div
            class="mobile-menu-content"
            (click)="$event.stopPropagation()"
            (keydown.escape)="$event.stopPropagation()"
            role="menu"
            tabindex="-1"
            @dropdown
          >
            @for (module of modules(); track module.id) {
              <div
                class="mobile-module-item"
                [class.active]="currentModule() === module.id"
                (click)="selectModuleAndCloseMenu(module)"
                (keydown.enter)="selectModuleAndCloseMenu(module)"
                (keydown.space)="selectModuleAndCloseMenu(module); $event.preventDefault()"
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
                (click)="navigateToProfileAndCloseMenu()"
                class="mobile-module-item text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary w-full text-left"
              >
                {{ 'Navbar.profile' | translate }}
              </button>
              <button
                (click)="navigateToNotificationSettingsAndCloseMenu()"
                class="mobile-module-item text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary w-full text-left"
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
                class="mobile-module-item text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300 w-full text-left"
              >
                {{ 'Basic.logout' | translate }}
              </button>
            </div>
          </div>
        </div>
      }

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
  readonly visibleItemsCount = input<number>(2);

  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly notificationStateService = inject(NotificationStateService);

  private routerSubscription: Subscription;

  private readonly defaultModules: NavModule[] = configNavModules;

  protected readonly modules = signal<NavModule[]>(this.defaultModules);
  protected readonly sections = signal<NavSection[]>([]);
  protected readonly visibleSections = signal<NavSection[]>([]);
  protected readonly currentModule = signal<string>('');
  protected readonly currentSection = signal<string>('');
  protected readonly unreadNotificationCount = this.notificationStateService.unreadCount;

  protected menuOpen: boolean = false;
  protected mobileMenuOpen: boolean = false;
  protected showAllSections: boolean = false;
  protected languageDropdownOpen: boolean = false;
  protected profileDropdownOpen: boolean = false;
  protected readonly languages: string[] = ['pl', 'en'];

  constructor() {
    this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.initializeNavigation();
    });
  }

  ngOnInit(): void {
    this.initializeNavigation();
    this.notificationStateService.refreshNotifications();

    document.addEventListener('click', this.handleOutsideClick);
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    document.removeEventListener('click', this.handleOutsideClick);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.languageDropdownOpen) {
      this.closeLanguageDropdown();
    }
  }

  protected getCurrentLanguage(): string {
    return this.translateService.currentLang.toUpperCase();
  }

  protected toggleLanguageDropdown(event: Event): void {
    event.stopPropagation();
    this.languageDropdownOpen = !this.languageDropdownOpen;
    if (this.languageDropdownOpen) this.profileDropdownOpen = false;
  }

  protected closeLanguageDropdown = (): void => {
    this.languageDropdownOpen = false;
    document.removeEventListener('click', this.closeLanguageDropdown);
  };

  protected toggleProfileDropdown(event: Event): void {
    event.stopPropagation();
    this.profileDropdownOpen = !this.profileDropdownOpen;
    if (this.profileDropdownOpen) this.languageDropdownOpen = false;
  }

  protected closeProfileDropdown = (): void => {
    this.profileDropdownOpen = false;
    document.removeEventListener('click', this.closeProfileDropdown);
  };

  protected selectLanguage(lang: string): void {
    this.translateService.use(lang);
    this.localStorageService.set('selected_language', lang);
    this.languageDropdownOpen = false;
    this.languageDropdownOpen = false;
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
  }

  protected selectSection(section: NavSection): void {
    this.currentSection.set(section.id);
    this.router.navigate([section.route]).then();
  }

  protected selectModuleAndCloseMenu(module: NavModule): void {
    this.selectModule(module);
    this.closeMenu();
  }

  protected navigateToProfileAndCloseMenu(): void {
    this.router.navigate(['/user-profile']).then();
    this.closeMenu();
  }

  protected navigateToNotificationSettingsAndCloseMenu(): void {
    this.router.navigate(['/notification-settings']).then();
    this.closeMenu();
  }

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  protected closeMenu(): void {
    this.menuOpen = false;
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/']).then();
    if (this.menuOpen) {
      this.closeMenu();
    }
  }

  protected navigateToHomePage(): void {
    this.router.navigate(['/']).then();
  }

  protected navigateToLoginPage(): void {
    this.router.navigate(['/login']).then(() => (this.mobileMenuOpen = false));
  }

  protected navigateToRegisterPage(): void {
    this.router.navigate(['/register']).then(() => (this.mobileMenuOpen = false));
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

  private handleOutsideClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;

    if (this.languageDropdownOpen && !target.closest('.language-button')) {
      this.languageDropdownOpen = false;
    }

    if (this.profileDropdownOpen && !target.closest('.profile-button')) {
      this.profileDropdownOpen = false;
    }
  };
}
