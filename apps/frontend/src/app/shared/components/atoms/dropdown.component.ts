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
  ViewChild,
  afterNextRender,
  Injector,
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
        visibility: hidden;
      }

      .dropdown-menu.position-ready {
        visibility: visible;
      }

      .dropdown-menu.align-left {
        left: 0;
      }
      .dropdown-menu.align-right {
        right: 0;
      }

      .dropdown-menu.align-top {
        bottom: 100%;
        margin-bottom: 0.25rem;
      }
      .dropdown-menu.align-bottom {
        top: 100%;
        margin-top: 0.25rem;
      }

      .dropdown-menu {
        animation: dropdown-enter 200ms ease-out forwards;
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
          #dropdownMenu
          class="dropdown-menu"
          [ngClass]="{
            'align-left': !isRightAligned() && !isCentered(),
            'align-right': isRightAligned() && !isCentered(),
            'align-top': isTopAligned(),
            'align-bottom': !isTopAligned(),
            'position-ready': isPositionReady(),
          }"
          tabindex="-1"
          role="menu"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
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
  public isCentered = signal(false);
  public isPositionReady = signal(false);

  @ViewChild('dropdownMenu') private readonly dropdownMenuRef?: ElementRef<HTMLElement>;

  private readonly elementRef = inject(ElementRef);
  private readonly injector = inject(Injector);

  constructor() {
    effect(() => this.handleCloseSignal());
  }

  ngOnDestroy(): void {
    if (activeDropdownRegistry() === this) {
      activeDropdownRegistry.set(null);
    }
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

      this.isOpen.set(true);
      activeDropdownRegistry.set(this);
      this.calculatePosition();
    }
  }

  public close(): void {
    this.isOpen.set(false);
    this.isPositionReady.set(false);
    this.isCentered.set(false);

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

  private handleCloseSignal(): void {
    const signalValue = this.closeSignal();
    if (signalValue) {
      untracked(() => this.close());
    }
  }

  private calculatePosition(): void {
    const triggerRect = this.elementRef.nativeElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    this.applyHorizontalPosition(triggerRect, viewportWidth, 300);
    this.isTopAligned.set(triggerRect.bottom > viewportHeight / 2);
    this.isPositionReady.set(false);

    afterNextRender(
      () => {
        const menuEl = this.dropdownMenuRef?.nativeElement;
        if (!menuEl) {
          this.isPositionReady.set(true);
          return;
        }

        const actualWidth = menuEl.getBoundingClientRect().width;
        this.applyHorizontalPosition(triggerRect, viewportWidth, actualWidth);

        if (this.isCentered()) {
          const centerOffset = viewportWidth / 2 - triggerRect.left - actualWidth / 2;
          menuEl.style.left = `${centerOffset}px`;
        } else {
          menuEl.style.left = '';
        }

        this.isPositionReady.set(true);
      },
      { injector: this.injector },
    );
  }

  private applyHorizontalPosition(triggerRect: DOMRect, viewportWidth: number, menuWidth: number): void {
    const overflowsRight = triggerRect.left + menuWidth > viewportWidth;
    const overflowsLeft = triggerRect.right - menuWidth < 0;

    if (overflowsRight && overflowsLeft) {
      this.isCentered.set(true);
      this.isRightAligned.set(false);
    } else if (overflowsRight) {
      this.isCentered.set(false);
      this.isRightAligned.set(true);
    } else {
      this.isCentered.set(false);
      this.isRightAligned.set(false);
    }
  }
}
