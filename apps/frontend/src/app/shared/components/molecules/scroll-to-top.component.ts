import { Component, HostListener } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroChevronUp } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-scroll-to-top',
  imports: [NgIconComponent],
  providers: [provideIcons({ heroChevronUp })],
  template: `
    @if (isVisible) {
      <button
        (click)="scrollToTop()"
        class="fixed bottom-12 right-8 px-3 py-2 bg-orange-500 border border-black text-white rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300 animate-fade-in"
        aria-label="Scroll to top"
      >
        <ng-icon name="heroChevronUp" class="w-6 h-6" />
      </button>
    }
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
