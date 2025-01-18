import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, input, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBars4,
  heroChevronDown,
  heroChevronUp,
  heroClipboardDocumentList,
  heroExclamationCircle,
  heroListBullet,
  heroSquares2x2,
  heroUserCircle,
} from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { configNavModules } from '../../../config/config.nav.modules';
import { LocalStorageService } from '../../services/local-storage.service';
import { NavModule, NavSection } from '../../types/config.type';
import { ThemeSwitcherComponent } from '../atoms/theme-switcher.component';

@Component({
  selector: 'app-navbar',
  imports: [NgIconComponent, TranslateModule, CommonModule, RouterOutlet, ThemeSwitcherComponent],
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
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
  styles: [`
    .top-nav {
      @apply h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 px-2.5 md:px-6 transition-colors duration-200;
    }

    .nav-content {
      @apply h-full mx-auto flex items-center justify-between;
    }

    .modules-container {
      @apply hidden md:flex space-x-8;
    }

    .module-item {
      @apply flex items-center space-x-2 px-3.5 py-1 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-gray-200;
    }

    .module-item.active {
      @apply bg-orange-50 dark:bg-orange-900/50 text-orange-500 dark:text-orange-400 transition-colors duration-200;
    }

    .auth-section {
      @apply flex items-center space-x-4;
    }

    .auth-button {
      @apply px-3 py-1.5 rounded-md transition-colors duration-200 text-sm font-medium;
    }

    .login-button {
      @apply text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/50 transition-colors duration-200 dark:hover:bg-gray-700;
    }

    .register-button {
      @apply bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 transition-colors duration-200;
    }

    .logout-button {
      @apply text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200;
    }

    .menu-button {
      @apply flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 relative transition-colors duration-200;
    }

    .menu-button.active {
      @apply bg-orange-50 dark:bg-orange-900/50 text-orange-500 dark:text-orange-400 transition-colors duration-200;
    }

    .mobile-menu {
      @apply fixed inset-0 z-50 md:hidden;
    }

    .mobile-menu-overlay {
      @apply absolute inset-0 bg-black/30;
    }

    .mobile-menu-content {
      @apply absolute w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 border border-gray-200 dark:border-gray-700 transition-colors duration-200;
      position: absolute;
      top: 3.5rem;
      left: 4rem;
    }

    .mobile-menu-content.language-menu {
      @apply absolute w-24 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 border border-gray-200 dark:border-gray-700 transition-colors duration-200;
      position: absolute;
      top: 3rem;
      right: 0.5rem;
      left: auto;
      z-index: 60;
    }

    .mobile-module-item {
      @apply flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm cursor-pointer dark:text-gray-200;
    }

    .mobile-module-item.active {
      @apply bg-orange-50 dark:bg-orange-900/50 text-orange-500 dark:text-orange-400 transition-colors duration-200;
    }

    .side-nav {
      @apply hidden md:block w-24 bg-white dark:bg-gray-800 fixed left-0 top-16 bottom-0 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200;
    }

    .side-nav-content {
      @apply h-full flex flex-col items-center justify-start py-8 space-y-4;
    }

    .mobile-sections {
      @apply md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-200;
    }

    .mobile-section-item {
      @apply flex items-center space-x-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 dark:text-gray-200;
    }

    .mobile-section-item.active {
      @apply bg-orange-50 dark:bg-orange-900/50 text-orange-500 dark:text-orange-400 transition-colors duration-200;
    }

    .mobile-section-icon {
      @apply text-base;
    }

    .mobile-section-text {
      @apply text-sm;
    }

    .show-more-button {
      @apply w-full flex items-center justify-center py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200;
    }

    .section-item {
      @apply flex flex-col items-center justify-center w-20 py-2 cursor-pointer rounded-xl relative transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors duration-200;
    }

    .section-item.active {
      @apply bg-orange-50 dark:bg-orange-900/50 text-orange-500 dark:text-orange-400 transition-colors duration-200;
    }

    .section-icon {
      @apply mb-2;
    }

    .section-title {
      @apply text-xs font-medium text-center;
    }

    .counter-badge {
      @apply absolute -top-1 -right-1 bg-orange-500 dark:bg-orange-600 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 transition-colors duration-200;
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
      @apply text-lg md:text-xl font-bold text-gray-800 dark:text-white transition-colors duration-200;
    }

    .language-button {
      @apply flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200 relative;
    }

    .language-dropdown {
      @apply absolute right-0 top-full mt-1 w-24 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 border border-gray-200 dark:border-gray-700 transition-colors duration-200;
    }

    .language-option {
      @apply px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer w-full text-left transition-colors duration-200;
    }

    .language-option.active {
      @apply text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/50 transition-colors duration-200;
    }
  `],
  template: `
    @if (!authService.isLoggedIn()) {
      <nav class="top-nav">
        <div class="public-nav">
          <span class="app-logo cursor-pointer" (click)="navigateToHomePage()">{{ 'Basic.appName' | translate }}</span>
          <div class="auth-section">
            <button class="auth-button login-button" (click)="router.navigate(['/login'])">
              {{ 'Basic.login' | translate }}
            </button>
            <button class="auth-button register-button" (click)="router.navigate(['/register'])">
              {{ 'Basic.register' | translate }}
            </button>
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
              >
                <ng-icon [name]="module.icon" size="24"></ng-icon>
                <span class="font-medium">{{ module.title | translate }}</span>
              </div>
            }
          </div>

          <div class="hidden md:flex items-center space-x-4">
            <button (click)="logout()" class="auth-button logout-button">
              {{ 'Basic.logout' | translate }}
            </button>
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
            <div class="relative flex flex-row">
              <app-theme-switcher />
              <button class="menu-button" (click)="toggleLanguageDropdown($event)">
                <span>{{ getCurrentLanguage() }}</span>
                <ng-icon [name]="languageDropdownOpen ? 'heroChevronUp' : 'heroChevronDown'" size="16"></ng-icon>
              </button>

              @if (languageDropdownOpen) {
                <div class="mobile-menu" (click)="closeLanguageDropdown()">
                  <div class="mobile-menu-overlay" @overlay></div>
                  <div
                    class="mobile-menu-content language-menu"
                    (click)="$event.stopPropagation()"
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
        <div class="mobile-menu" (click)="closeMenu()">
          <div class="mobile-menu-overlay" @overlay></div>
          <div
            class="mobile-menu-content"
            (click)="$event.stopPropagation()"
            @dropdown
          >
            @for (module of modules(); track module.id) {
              <div
                class="mobile-module-item"
                [class.active]="currentModule() === module.id"
                (click)="selectModuleAndCloseMenu(module)"
              >
                <ng-icon [name]="module.icon" size="20"></ng-icon>
                <span>{{ module.title | translate }}</span>
              </div>
            }
            <div class="border-t border-gray-200 mt-1">
              <button (click)="logout()" class="mobile-module-item text-red-500 hover:text-red-600 w-full text-left">
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
            >
              <div class="relative">
                <ng-icon [name]="section.icon" size="24" class="section-icon"></ng-icon>
                @if (section.id === 'urgent' && urgentCount() > 0) {
                  <span class="counter-badge">{{ urgentCount() }}</span>
                }
                @if (section.id === 'projects' && projectCount() > 0) {
                  <span class="counter-badge">{{ projectCount() }}</span>
                }
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
          >
            <div class="relative flex items-center">
              <ng-icon [name]="section.icon" size="20" class="mobile-section-icon"></ng-icon>
              @if (section.id === 'urgent' && urgentCount() > 0) {
                <span class="counter-badge">{{ urgentCount() }}</span>
              }
              @if (section.id === 'projects' && projectCount() > 0) {
                <span class="counter-badge">{{ projectCount() }}</span>
              }
            </div>
            <span class="mobile-section-text">{{ section.title | translate }}</span>
          </div>
        }

        @if (sections().length > visibleItemsCount()) {
          <button class="show-more-button" (click)="toggleShowAllSections()">
            <ng-icon [name]="showAllSections ? 'heroChevronUp' : 'heroChevronDown'" size="16"></ng-icon>
            <span
              class="ml-1">{{ showAllSections ? ('Basic.showLess' | translate) : ('Basic.showMore' | translate) }}</span>
          </button>
        }
      </div>
    }

    <div ngClass="main-content" [class.authenticated]="authService.isLoggedIn()">
      <div class="content-wrapper">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly urgentCount = input<number>(0);
  readonly projectCount = input<number>(0);
  readonly visibleItemsCount = input<number>(2);

  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly localStorageService = inject(LocalStorageService);

  private readonly defaultModules: NavModule[] = configNavModules;

  protected readonly modules = signal<NavModule[]>(this.defaultModules);
  protected readonly sections = signal<NavSection[]>([]);
  protected readonly visibleSections = signal<NavSection[]>([]);
  protected readonly currentModule = signal<string>('');
  protected readonly currentSection = signal<string>('');

  protected menuOpen: boolean = false;
  protected showAllSections: boolean = false;
  protected languageDropdownOpen: boolean = false;
  protected readonly languages: string[] = ['pl', 'en'];

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe(() => {
      setTimeout(() => this.initializeNavigation(), 0);
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.initializeNavigation(), 0);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeLanguageDropdown);
  }

  protected getCurrentLanguage(): string {
    return this.translateService.currentLang.toUpperCase();
  }

  protected toggleLanguageDropdown(event: Event): void {
    event.stopPropagation();
    this.languageDropdownOpen = !this.languageDropdownOpen;
    if (this.languageDropdownOpen) {
      setTimeout(() => {
        document.addEventListener('click', this.closeLanguageDropdown);
      });
    }
  }

  protected closeLanguageDropdown = (): void => {
    this.languageDropdownOpen = false;
    document.removeEventListener('click', this.closeLanguageDropdown);
  };

  protected selectLanguage(lang: string): void {
    this.translateService.use(lang);
    this.localStorageService.set('selectedLanguage', lang);
    this.languageDropdownOpen = false;
    document.removeEventListener('click', this.closeLanguageDropdown);
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
    if (module.id !== this.currentModule()) {
      this.currentModule.set(module.id);
      this.sections.set(module.sections);
      this.showAllSections = false;
      this.updateVisibleSections();

      const defaultSection = module.sections[0];
      this.currentSection.set(defaultSection.id);

      this.router.navigate([module.route]).then();
    }
  }

  protected selectSection(section: NavSection): void {
    this.currentSection.set(section.id);
    this.router.navigate([section.route]).then();
  }

  protected selectModuleAndCloseMenu(module: NavModule): void {
    this.selectModule(module);
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

  private initializeNavigation(): void {
    const currentUrl = this.router.url;

    const activeModule = this.defaultModules
      .slice()
      .reverse()
      .find(module => {
        const moduleRoute = module.route === '/' ? '/' : module.route;
        const sectionRoutes = module.sections.map(section => section.route);

        return currentUrl.startsWith(moduleRoute)
          || sectionRoutes.some(route => currentUrl.startsWith(route === '/' ? '/' : route));
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
