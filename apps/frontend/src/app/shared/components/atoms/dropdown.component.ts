import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  signal,
  input,
  OnDestroy,
  untracked,
} from '@angular/core';

const activeDropdownRegistry = signal<DropdownComponent | null>(null);

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      @reference "../../../../style.css";

      :host {
        display: inline-block;
        position: relative;
      }

      .dropdown-container {
        @apply inline-flex items-center w-full h-full cursor-pointer outline-none focus:outline-none;
        -webkit-tap-highlight-color: transparent;
      }

      .dropdown-menu {
        @apply absolute min-w-max z-[100] outline-none focus:outline-none;
      }

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

      .anim-dropdown-enter {
        animation: dropdown-enter 200ms ease-out forwards;
      }

      .anim-dropdown-leave {
        animation: dropdown-leave 200ms ease-in forwards;
      }
    `,
  ],
  template: `
    <div
      class="dropdown-container"
      tabindex="0"
      role="button"
      [attr.aria-expanded]="isOpen()"
      (click)="toggleDropdown($event)"
      (keydown.enter)="toggleDropdown($event)"
      (keydown.space)="toggleDropdown($event)"
    >
      <ng-content select="[dropdownTrigger]"></ng-content>

      @if (isOpen()) {
        <div
          class="dropdown-menu"
          [class.left-0]="!isRightAligned()"
          [class.right-0]="isRightAligned()"
          [class.top-full]="!isTopAligned()"
          [class.mt-1]="!isTopAligned()"
          [class.bottom-full]="isTopAligned()"
          [class.mb-1]="isTopAligned()"
          tabindex="-1"
          role="menu"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
          animate.enter="anim-dropdown-enter"
          animate.leave="anim-dropdown-leave"
        >
          <ng-content select="[dropdownMenu]"></ng-content>
        </div>
      }
    </div>
  `,
})
export class DropdownComponent implements OnDestroy {
  public closeSignal = input<number>();

  public readonly isOpen = signal(false);

  public isRightAligned = signal(false);
  public isTopAligned = signal(false);

  private readonly elementRef = inject(ElementRef);

  constructor() {
    effect(() => this.handleCloseSignal());
  }

  private handleCloseSignal(): void {
    const signalValue = this.closeSignal();

    if (signalValue) {
      untracked(() => {
        this.close();
      });
    }
  }

  private calculatePosition(): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    this.isRightAligned.set(rect.right > viewportWidth / 2);
    this.isTopAligned.set(rect.bottom > viewportHeight / 2);
  }

  public toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isOpen()) {
      this.close();
    } else {
      const currentActive = activeDropdownRegistry();
      if (currentActive && currentActive !== this) {
        currentActive.close();
      }

      this.calculatePosition();
      this.isOpen.set(true);

      activeDropdownRegistry.set(this);
    }
  }

  public close(): void {
    this.isOpen.set(false);

    if (activeDropdownRegistry() === this) {
      activeDropdownRegistry.set(null);
    }
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  public onEscapeKey(): void {
    this.close();
  }

  ngOnDestroy(): void {
    if (activeDropdownRegistry() === this) {
      activeDropdownRegistry.set(null);
    }
  }
}
