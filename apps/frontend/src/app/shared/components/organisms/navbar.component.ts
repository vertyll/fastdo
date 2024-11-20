import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { heroBars4 } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';
import { LinkComponent } from '../atoms/link.component';
import { LinkType } from '../../enums/link.enum';

@Component({
    selector: 'app-navbar',
    imports: [NgIconComponent, TranslateModule, LinkComponent],
    viewProviders: provideIcons({ heroBars4 }),
    styles: [
        `
      nav {
        @apply px-12 border-t-4 border-b-4 rounded-bl-xl rounded-br-xl border-black;
      }
      .menu-open {
        @apply fixed inset-0 bg-black bg-opacity-50 z-50;
      }
      .menu-content {
        @apply fixed top-0 right-0 h-full w-1/2 bg-white shadow-lg transition-transform duration-300 ease-in-out transform translate-x-full;
      }
      .menu-content.open {
        @apply translate-x-0;
      }
    `,
    ],
    template: `
    <nav class="bg-orange-300 py-4">
      <div class="flex justify-between items-center">
        <span
          (click)="
            authService.isLoggedIn()
              ? router.navigate(['/tasks'])
              : router.navigate(['/'])
          "
          class="border-2 border-black text-black font-bold px-2 py-1 mx-4 cursor-pointer"
        >
          {{ 'Basic.appName' | translate }}
        </span>
        <ul class="hidden md:flex gap-6">
          @if (authService.isLoggedIn()) {
            <li>
              <app-link [routerLink]="['/tasks']" [linkType]="LinkType.Nav">
                {{ 'Navbar.tasks' | translate }}
              </app-link>
            </li>
            <li>
              <app-link [routerLink]="['/projects']" [linkType]="LinkType.Nav">
                {{ 'Navbar.projects' | translate }} ({{ projectCount() }})
              </app-link>
            </li>
          }
        </ul>
        <ul class="hidden md:flex gap-6 ml-auto">
          @if (authService.isLoggedIn()) {
            <li>
              <app-link
                [routerLink]="['/tasks/urgent']"
                [linkType]="LinkType.Nav"
              >
                {{ 'Navbar.urgent' | translate }} ({{ urgentCount() }})
              </app-link>
            </li>
            <li>
              <button
                (click)="logout()"
                class="text-red-500 hover:text-red-600"
              >
                {{ 'Basic.logout' | translate }}
              </button>
            </li>
          } @else {
            <li>
              <app-link [routerLink]="['/login']" [linkType]="LinkType.Nav">
                {{ 'Basic.login' | translate }}
              </app-link>
            </li>
            <li>
              <app-link [routerLink]="['/register']" [linkType]="LinkType.Nav">
                {{ 'Basic.register' | translate }}
              </app-link>
            </li>
          }
        </ul>
        <button
          class="md:hidden ml-auto flex items-center justify-center"
          (click)="toggleMenu()"
        >
          <ng-icon name="heroBars4" size="24"></ng-icon>
        </button>
      </div>
      <div [class.menu-open]="menuOpen" (click)="closeMenu()">
        <ul
          [class.open]="menuOpen"
          class="menu-content flex flex-col gap-4 p-4"
          (click)="$event.stopPropagation()"
        >
          @if (!authService.isLoggedIn(); as loggedIn) {
            <li>
              <app-link
                [routerLink]="['/login']"
                [linkType]="LinkType.Nav"
                (click)="closeMenu()"
              >
                {{ 'Basic.login' | translate }}
              </app-link>
            </li>
            <li>
              <app-link
                [routerLink]="['/register']"
                [linkType]="LinkType.Nav"
                (click)="closeMenu()"
              >
                {{ 'Basic.register' | translate }}
              </app-link>
            </li>
          } @else {
            <li>
              <app-link
                [routerLink]="['/tasks']"
                [linkType]="LinkType.Nav"
                (click)="closeMenu()"
              >
                {{ 'Navbar.tasks' | translate }}
              </app-link>
            </li>
            <li>
              <app-link
                [routerLink]="['/projects']"
                [linkType]="LinkType.Nav"
                (click)="closeMenu()"
              >
                {{ 'Navbar.projects' | translate }} ({{ projectCount() }})
              </app-link>
            </li>
            <li>
              <app-link
                [routerLink]="['/tasks/urgent']"
                [linkType]="LinkType.Nav"
                (click)="closeMenu()"
              >
                {{ 'Navbar.urgent' | translate }} ({{ urgentCount() }})
              </app-link>
            </li>
            <li>
              <button
                (click)="logout()"
                class="text-red-500 hover:text-red-600"
              >
                {{ 'Basic.logout' | translate }}
              </button>
            </li>
          }
        </ul>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  readonly urgentCount = input<number>(0);
  readonly projectCount = input<number>(0);

  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  protected readonly LinkType = LinkType;

  protected menuOpen: boolean = false;

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  protected closeMenu(): void {
    this.menuOpen = false;
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);

    if (this.menuOpen) {
      this.closeMenu();
    }
  }
}
