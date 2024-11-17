import { Component, HostListener } from '@angular/core';
import { heroChevronUp } from '@ng-icons/heroicons/outline';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ heroChevronUp })],
  template: `
    <button
      *ngIf="isVisible"
      (click)="scrollToTop()"
      class="fixed bottom-12 right-8 px-4 py-3 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300 animate-fade-in"
      aria-label="Scroll to top"
    >
      <ng-icon name="heroChevronUp" class="w-6 h-6"></ng-icon>
    </button>
  `,
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }
    `,
  ],
})
export class ScrollToTopComponent {
  protected isVisible: boolean = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isVisible = window.scrollY > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
