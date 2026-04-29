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
  ContentChild,
  Directive,
  TemplateRef,
} from '@angular/core';

@Directive({
  selector: '[appDropdownMenu]',
  standalone: true,
})
export class DropdownMenuDirective {
  public templateRef = inject(TemplateRef<any>);
}

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
        @apply z-[9999] outline-none focus:outline-none;
        position: fixed;
        visibility: hidden;
        animation: dropdown-enter 200ms ease-out forwards;
      }

      .dropdown-menu.position-ready {
        visibility: visible;
      }

      @keyframes dropdown-enter {
        from {
          opacity: 0;
          transform: translateY(-6px);
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
          class="dropdown-menu flex flex-col items-stretch bg-surface-primary dark:bg-dark-surface-primary shadow-medium rounded-md py-1 border border-border-primary dark:border-dark-border-primary transition-colors duration-200"
          [class.position-ready]="isPositionReady()"
          tabindex="-1"
          role="menu"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
        >
          <ng-container *ngTemplateOutlet="menuDirective?.templateRef || null"></ng-container>
        </div>
      }
    </div>
  `,
})
export class DropdownComponent implements OnDestroy {
  public closeSignal = input<number>();

  public readonly isOpen = signal(false);
  public isPositionReady = signal(false);

  @ContentChild(DropdownMenuDirective) public menuDirective?: DropdownMenuDirective;

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
    this.isPositionReady.set(false);

    afterNextRender(
      () => {
        const menuEl = this.dropdownMenuRef?.nativeElement;
        if (!menuEl) return;

        const triggerRect = this.elementRef.nativeElement.getBoundingClientRect();

        menuEl.style.minWidth = `${triggerRect.width}px`;

        const menuRect = menuEl.getBoundingClientRect();

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const spaceBelow = vh - triggerRect.bottom;
        const openUpward = spaceBelow < menuRect.height && triggerRect.top > spaceBelow;
        const top = openUpward ? triggerRect.top - menuRect.height - 4 : triggerRect.bottom + 4;

        menuEl.style.top = `${top}px`;

        const fitsFromLeft = triggerRect.left + menuRect.width <= vw;
        const fitsFromRight = triggerRect.right - menuRect.width >= 0;

        if (!fitsFromLeft && !fitsFromRight) {
          menuEl.style.left = `${(vw - menuRect.width) / 2}px`;
        } else if (fitsFromLeft) {
          menuEl.style.left = `${triggerRect.left}px`;
        } else {
          menuEl.style.left = `${triggerRect.right - menuRect.width}px`;
        }

        this.isPositionReady.set(true);
      },
      { injector: this.injector },
    );
  }
}
