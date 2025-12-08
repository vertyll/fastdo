import { Component, HostListener } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroChevronUp } from '@ng-icons/heroicons/outline';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-scroll-to-top',
  imports: [NgIconComponent, TranslatePipe],
  providers: [provideIcons({ heroChevronUp })],
  template: `
    @if (isVisible) {
      <button
        (click)="scrollToTop()"
        class="fixed bottom-12 right-8 px-3 py-2 bg-primary-500 border border-neutral-900 text-white rounded-lg shadow-lg hover:bg-primary-600 transition-all duration-300 animate-fade-in"
        [attr.aria-label]="'Basic.scrollToTop' | translate"
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
  onWindowScroll(): void {
    this.isVisible = window.scrollY > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
