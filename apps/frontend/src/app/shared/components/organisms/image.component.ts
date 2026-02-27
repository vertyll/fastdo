import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCamera, heroEye, heroUserCircle, heroXMark } from '@ng-icons/heroicons/outline';
import { TranslatePipe } from '@ngx-translate/core';
import Cropper from 'cropperjs';
import { environment } from '../../../../environments/environment';

export type ImageMode = 'view' | 'preview' | 'edit';
export type ImageFormat = 'circle' | 'square';
export type ImageSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [CommonModule, NgIconComponent, TranslatePipe],
  providers: [provideIcons({ heroCamera, heroUserCircle, heroEye, heroXMark })],
  template: `
    <div class="relative">
      <!-- Base Image Container -->
      <div [ngClass]="getContainerClasses()">
        @if (previewUrl()) {
          <img
            [src]="previewUrl()"
            class="w-full h-full object-cover"
            [ngClass]="{ 'cursor-pointer': mode() === 'preview' }"
            alt="Preview"
            (click)="handleImageClick()"
            (keydown.enter)="handleImageClick()"
            (keydown.space)="handleImageClick(); $event.preventDefault()"
            [attr.role]="mode() === 'preview' ? 'button' : null"
            [attr.tabindex]="mode() === 'preview' ? '0' : null"
          />
        } @else {
          <ng-icon
            name="heroUserCircle"
            [size]="getIconSize()"
            class="text-text-secondary dark:text-dark-text-secondary"
          />
        }

        @if (mode() === 'edit') {
          <button
            class="absolute flex bottom-3 right-2 bg-background-primary dark:bg-dark-background-primary rounded-full p-2 shadow-md hover:bg-background-secondary dark:hover:bg-dark-background-secondary transition-colors duration-200"
            (click)="$event.preventDefault(); $event.stopPropagation(); fileInput.click()"
            [attr.aria-label]="'Image.uploadImage' | translate"
          >
            <ng-icon name="heroCamera" size="20" class="text-text-primary dark:text-dark-text-primary" />
          </button>
          @if (previewUrl()) {
            <button
              class="absolute flex bottom-3 right-14 bg-red-500 hover:bg-red-600 rounded-full p-2 shadow-md  transition-colors duration-200"
              (click)="$event.preventDefault(); $event.stopPropagation(); removeImage()"
              [attr.aria-label]="'Image.removeImage' | translate"
              [title]="'Image.removeImage' | translate"
            >
              <ng-icon name="heroXMark" size="20" class="text-white" />
            </button>
          }
        }
        <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)" accept="image/jpeg,image/png" />
      </div>

      <!-- Preview Modal -->
      @if (showPreviewModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-1111 p-4">
          <div class="bg-background-primary dark:bg-dark-background-primary rounded-lg p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
                {{ 'Image.fullPreview' | translate }}
              </h3>
              <button
                (click)="closePreviewModal()"
                class="text-text-secondary hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                [attr.aria-label]="'Basic.close' | translate"
              >
                <ng-icon name="heroXMark" size="24" />
              </button>
            </div>
            <img [src]="getFullImageUrl(previewUrl())" class="max-h-150 w-auto mx-auto" alt="Full Preview" />
          </div>
        </div>
      }

      <!-- Cropper Modal -->
      @if (showCropper()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-background-primary dark:bg-dark-background-primary rounded-lg p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
                {{ 'Image.cutPhoto' | translate }}
              </h3>
              <button
                (click)="closeCropper()"
                class="text-text-secondary hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                [attr.aria-label]="'Basic.close' | translate"
              >
                <ng-icon name="heroXMark" size="24" />
              </button>
            </div>

            <div class="relative w-full h-96">
              <img #cropperImage [src]="tempImageUrl()" class="max-w-full" alt="Cropper" />
            </div>

            <div class="flex justify-end mt-4 space-x-3">
              <button
                (click)="closeCropper()"
                class="px-4 py-2 text-text-primary dark:text-dark-text-primary bg-neutral-200 dark:bg-neutral-700 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors duration-200"
                [attr.aria-label]="'Basic.cancel' | translate"
              >
                {{ 'Basic.cancel' | translate }}
              </button>
              <button
                (click)="save()"
                [disabled]="isSaving()"
                class="px-4 py-2 text-white bg-primary-500 rounded-md hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"
                [attr.aria-label]="isSaving() ? ('Basic.saving' | translate) : ('Basic.save' | translate)"
              >
                {{ isSaving() ? ('Basic.saving' | translate) : ('Basic.save' | translate) }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .cropper-view-box,
      .cropper-face {
        border-radius: var(--cropper-view-box-border-radius, 0%);
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ImageComponent implements OnDestroy {
  private readonly baseUrl = environment.backendUrl;

  mode = input<ImageMode>('view');
  format = input<ImageFormat>('circle');
  size = input<ImageSize>('md');
  initialUrl = input<string | null>(null);

  imageSaved = output<{ file: File; preview: string | null }>();
  croppingChange = output<boolean>();
  imageRemoved = output<void>();

  protected previewUrl = signal<string | null>(null);
  protected showCropper = signal(false);
  protected showPreviewModal = signal(false);
  protected tempImageUrl = signal<string | null>(null);
  protected isSaving = signal(false);

  private cropper: Cropper | null = null;
  private selectedFile: File | null = null;

  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;

  @ViewChild('cropperImage')
  set cropperImage(element: ElementRef<HTMLImageElement>) {
    if (element && this.showCropper()) {
      if (this.cropper) {
        this.cropper.destroy();
      }

      this.cropper = new Cropper(element.nativeElement, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        background: false,
        responsive: true,
        scalable: true,
        zoomable: true,
        movable: true,
        rotatable: true,
        ready: () => {
          if (this.format() === 'circle') {
            document.documentElement.style.setProperty('--cropper-view-box-border-radius', '50%');
          }
        },
      });
    }
  }

  constructor() {
    effect(() => {
      const url = this.initialUrl();
      if (url) {
        this.previewUrl.set(this.getFullImageUrl(url));
      }
    });

    effect(() => {
      this.croppingChange.emit(this.showCropper());
    });
  }

  ngOnDestroy(): void {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }

    if (this.tempImageUrl()?.startsWith('blob:')) {
      URL.revokeObjectURL(this.tempImageUrl()!);
    }

    if (this.previewUrl()?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl()!);
    }
  }

  protected getFullImageUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;

    return url.startsWith('http') ? url : `${this.baseUrl}/${url}`;
  }

  protected getContainerClasses(): string {
    const sizeClasses = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32',
    };

    return `
      ${sizeClasses[this.size()]}
      ${this.format() === 'circle' ? 'rounded-full' : 'rounded-lg'}
      overflow-hidden
      bg-neutral-200
      dark:bg-neutral-700
      flex
      items-center
      justify-center
      relative
    `;
  }

  protected getIconSize(): string {
    const sizes = {
      sm: '32',
      md: '64',
      lg: '96',
    };
    return sizes[this.size()];
  }

  protected handleImageClick(): void {
    if (this.mode() === 'preview' && this.previewUrl()) {
      this.showPreviewModal.set(true);
    }
  }

  protected closePreviewModal(): void {
    this.showPreviewModal.set(false);
  }

  protected removeImage(): void {
    this.previewUrl.set(null);
    this.selectedFile = null;
    this.tempImageUrl.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.imageRemoved.emit();
  }

  protected onFileSelected(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();

      reader.onload = e => {
        const result = e.target?.result as string;
        if (result) {
          this.tempImageUrl.set(result);
          this.showCropper.set(true);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  protected closeCropper(): void {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }

    this.showCropper.set(false);
    this.tempImageUrl.set(null);

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  protected async save(): Promise<void> {
    if (!this.cropper || !this.selectedFile) return;

    try {
      this.isSaving.set(true);

      const canvas = this.cropper.getCroppedCanvas();
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(b => resolve(b!), 'image/png');
      });

      const originalFileName = this.selectedFile.name.replace(/\.[^/.]+$/, '');
      const file = new File([blob], `${originalFileName}-cropped.png`, { type: 'image/png' });
      const previewUrl = URL.createObjectURL(blob);

      this.previewUrl.set(previewUrl);
      this.imageSaved.emit({ file, preview: previewUrl });
      this.closeCropper();
    } catch (error) {
      console.error('Error saving cropped image:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
