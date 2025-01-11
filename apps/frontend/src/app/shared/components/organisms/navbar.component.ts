import {Component, inject, input, OnInit, signal} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {AuthService} from 'src/app/auth/data-access/auth.service';
import {
  heroClipboardDocumentList,
  heroListBullet,
  heroExclamationCircle,
  heroSquares2x2,
  heroUserCircle,
  heroBars4,
} from '@ng-icons/heroicons/outline';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {NavModule, NavSection} from '../../interfaces/navbar.interface';
import {modules} from 'src/app/config/modules';
import {animate, style, transition, trigger} from '@angular/animations';
import {filter} from "rxjs";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIconComponent, TranslateModule, CommonModule, RouterOutlet],
  viewProviders: [
    provideIcons({
      heroClipboardDocumentList,
      heroListBullet,
      heroExclamationCircle,
      heroSquares2x2,
      heroUserCircle,
      heroBars4,
    }),
  ],
  animations: [
    trigger('slideMenu', [
      transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate('300ms ease-out', style({transform: 'translateX(0)'})),
      ]),
      transition(':leave', [
        style({transform: 'translateX(0)'}),
        animate('300ms ease-in', style({transform: 'translateX(100%)'})),
      ]),
    ]),
    trigger('overlay', [
      transition(':enter', [
        style({opacity: 0}),
        animate('300ms ease-out', style({opacity: 1})),
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate('300ms ease-in', style({opacity: 0})),
      ]),
    ]),
  ],
  styles: [
    `
      .top-nav {
        @apply h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 px-2.5 md:px-6;
      }

      .nav-content {
        @apply h-full mx-auto flex items-center justify-between;
      }

      .modules-container {
        @apply hidden md:flex space-x-8;
      }

      .module-item {
        @apply flex items-center space-x-2 px-3.5 py-1 rounded-md cursor-pointer hover:bg-gray-50 transition-colors duration-200;
      }

      .module-item.active {
        @apply bg-orange-50 text-orange-500;
      }

      .auth-section {
        @apply flex items-center space-x-4;
      }

      .auth-button {
        @apply px-3 py-1.5 rounded-md transition-colors duration-200 text-sm font-medium;
      }

      .login-button {
        @apply text-orange-500 hover:bg-orange-50;
      }

      .register-button {
        @apply bg-orange-500 text-white hover:bg-orange-600;
      }

      .logout-button {
        @apply text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-red-500 hover:text-red-600;
      }

      .hamburger-button {
        @apply md:hidden flex items-center justify-center p-1 rounded-md hover:bg-gray-100 ml-auto;
      }

      .mobile-menu {
        @apply fixed inset-0 bg-black/30 z-50 md:hidden;
      }

      .mobile-menu-content {
        @apply fixed top-0 right-0 h-full w-64 bg-white shadow-lg;
      }

      .mobile-module-item {
        @apply flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors duration-200;
      }

      .mobile-module-item.active {
        @apply bg-orange-50 text-orange-500;
      }

      .side-nav {
        @apply w-24 bg-white fixed left-0 top-16 bottom-0 border-r border-gray-200 flex flex-col items-center py-4 md:py-8;
      }

      .section-item {
        @apply flex flex-col items-center justify-center w-20 py-2 cursor-pointer rounded-xl mb-3 md:mb-4 relative transition-all duration-200 hover:bg-gray-50;
      }

      .section-item.active {
        @apply bg-orange-50 text-orange-500;
      }

      .section-icon {
        @apply mb-1 md:mb-2;
      }

      .section-title {
        @apply text-xs font-medium text-center;
      }

      .counter-badge {
        @apply absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1;
      }

      .main-content {
        @apply pt-16;
      }

      .main-content-with-sidebar {
        @apply ml-24;
      }

      .content-wrapper {
        @apply mx-auto py-4 px-8;
      }

      .public-nav {
        @apply flex justify-between items-center h-full mx-auto px-4 md:px-8;
      }

      .app-logo {
        @apply text-lg md:text-xl font-bold text-gray-800;
      }

      @media (max-width: 768px) {
        .side-nav {
          @apply w-12;
        }

        .section-item {
          @apply w-10 py-1.5 mb-2;
        }

        .section-title {
          @apply text-[10px];
        }

        .main-content {
          @apply px-2;
        }

        .main-content-with-sidebar {
          @apply ml-12;
        }
      }
    `,
  ],
  template: `
    @if (!authService.isLoggedIn()) {
      <nav class="top-nav">
        <div class="public-nav">
          <span class="app-logo">{{ 'Basic.appName' | translate }}</span>
          <div class="auth-section">
            <button
              class="auth-button login-button"
              (click)="router.navigate(['/login'])"
            >
              {{ 'Basic.login' | translate }}
            </button>
            <button
              class="auth-button register-button"
              (click)="router.navigate(['/register'])"
            >
              {{ 'Basic.register' | translate }}
            </button>
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

          <div class="flex items-center">
            <button
              (click)="logout()"
              class="auth-button logout-button hidden md:block"
            >
              {{ 'Basic.logout' | translate }}
            </button>
            <button class="hamburger-button" (click)="toggleMenu()">
              <ng-icon name="heroBars4" size="24"></ng-icon>
            </button>
          </div>
        </div>
      </nav>

      @if (menuOpen) {
        <div class="mobile-menu" (click)="closeMenu()" @overlay>
          <div
            class="mobile-menu-content"
            (click)="$event.stopPropagation()"
            @slideMenu
          >
            @for (module of modules(); track module.id) {
              <div
                class="mobile-module-item"
                [class.active]="currentModule() === module.id"
                (click)="selectModuleAndCloseMenu(module)"
              >
                <ng-icon [name]="module.icon" size="24"></ng-icon>
                <span class="font-medium">{{ module.title | translate }}</span>
              </div>
            }
            <div class="border-t border-gray-200 mt-2">
              <button
                (click)="logout()"
                class="mobile-module-item text-red-500 hover:text-red-600 w-full text-left"
              >
                {{ 'Basic.logout' | translate }}
              </button>
            </div>
          </div>
        </div>
      }

      <nav class="side-nav">
        @for (section of sections(); track section.id) {
          <div
            class="section-item"
            [class.active]="currentSection() === section.id"
            (click)="selectSection(section)"
          >
            <div class="relative">
              <ng-icon [name]="section.icon" size="24" class="section-icon">
              </ng-icon>
              @if (section.id === 'urgent' && urgentCount() > 0) {
                <span class="counter-badge">{{ urgentCount() }}</span>
              }
              @if (section.id === 'projects' && projectCount() > 0) {
                <span class="counter-badge">{{ projectCount() }}</span>
              }
            </div>
            <span class="section-title">
              {{ section.title | translate }}
            </span>
          </div>
        }
      </nav>
    }

    <div class="main-content" [class.main-content-with-sidebar]="authService.isLoggedIn()">
      <div class="content-wrapper">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class NavbarComponent implements OnInit {
  readonly urgentCount = input<number>(0);
  readonly projectCount = input<number>(0);

  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  private readonly defaultModules = modules;

  protected readonly modules = signal<NavModule[]>(this.defaultModules);
  protected readonly sections = signal<NavSection[]>([]);
  protected readonly currentModule = signal<string>('');
  protected readonly currentSection = signal<string>('');
  protected menuOpen = false;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe(() => {
      setTimeout(() => this.initializeNavigation(), 0);
    });
  }

  ngOnInit() {
    setTimeout(() => this.initializeNavigation(), 0);
  }

  private initializeNavigation(): void {
    const currentUrl = this.router.url;

    const activeModule = this.defaultModules
      .slice()
      .reverse()
      .find(module => {
        const moduleRoute = module.route === '/' ? '/' : module.route;
        const sectionRoutes = module.sections.map(section => section.route);

        return currentUrl.startsWith(moduleRoute) ||
          sectionRoutes.some(route => currentUrl.startsWith(route === '/' ? '/' : route));
      }) || this.defaultModules[0];

    this.currentModule.set(activeModule.id);
    this.sections.set(activeModule.sections);

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

  protected selectModule(module: NavModule): void {
    if (module.id !== this.currentModule()) {
      this.currentModule.set(module.id);
      this.sections.set(module.sections);

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
}
