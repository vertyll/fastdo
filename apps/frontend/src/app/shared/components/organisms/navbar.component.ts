import { Component, inject, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { AuthService } from 'src/app/auth/data-access/auth.service';
import { heroBars4 } from '@ng-icons/heroicons/outline';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent, TranslateModule],
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
              <a
                routerLink="/tasks"
                routerLinkActive="font-bold"
                (click)="closeMenu()"
              >
                {{ 'Navbar.tasks' | translate }}
              </a>
            </li>
            <li>
              <a
                routerLink="/projects"
                routerLinkActive="font-bold"
                (click)="closeMenu()"
              >
                {{ 'Navbar.projects' | translate }} ({{ projectCount }})
              </a>
            </li>
          }
        </ul>
        <ul class="hidden md:flex gap-6 ml-auto">
          @if (authService.isLoggedIn()) {
            <li>
              <a
                routerLink="/tasks/urgent"
                routerLinkActive="font-bold"
                (click)="closeMenu()"
              >
                {{ 'Navbar.urgent' | translate }} ({{ urgentCount }})
              </a>
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
              <a routerLink="/login" (click)="closeMenu()">
                {{ 'Basic.login' | translate }}
              </a>
            </li>
            <li>
              <a routerLink="/register" (click)="closeMenu()">
                {{ 'Basic.register' | translate }}
              </a>
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
              <a routerLink="/login" (click)="closeMenu()">
                {{ 'Basic.login' | translate }}
              </a>
            </li>
            <li>
              <a routerLink="/register" (click)="closeMenu()">
                {{ 'Basic.register' | translate }}
              </a>
            </li>
          } @else {
            <li>
              <a
                routerLink="/tasks"
                routerLinkActive="font-bold"
                (click)="closeMenu()"
              >
                {{ 'Navbar.tasks' | translate }}
              </a>
            </li>
            <li>
              <a
                routerLink="/projects"
                routerLinkActive="font-bold"
                (click)="closeMenu()"
              >
                {{ 'Navbar.projects' | translate }}
                ({{ projectCount }})</a
              >
            </li>
            <li>
              <a
                routerLink="/tasks/urgent"
                routerLinkActive="font-bold"
                (click)="closeMenu()"
              >
                {{ 'Navbar.urgent' | translate }}
                ({{ urgentCount }})</a
              >
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
  `,
})
export class NavbarComponent {
  @Input() urgentCount: number = 0;
  @Input() projectCount: number = 0;

  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

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
  }
}
