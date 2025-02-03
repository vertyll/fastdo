import { CommonModule } from '@angular/common';
import {
  afterNextRender,
  Component,
  effect,
  inject,
  Injector,
  input,
  output,
  runInInjectionContext,
  signal
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCamera, heroEye, heroUserCircle, heroXMark } from '@ng-icons/heroicons/outline';
import { ImageCroppedEvent, ImageCropperComponent as NgxImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import {environment} from "../../../../environments/environment";

export type ImageMode = 'view' | 'preview' | 'edit';
export type ImageFormat = 'circle' | 'square';
export type ImageSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [CommonModule, NgxImageCropperComponent, NgIconComponent],
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
          />
        } @else {
          <ng-icon
            name="heroUserCircle"
            [size]="getIconSize()"
            class="text-gray-500"
          />
        }

        @if (mode() === 'edit') {
          <button
            class="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
            (click)="$event.stopPropagation(); fileInput.click()"
          >
            <ng-icon
              name="heroCamera"
              size="20"
              class="text-gray-700 dark:text-gray-300"
            />
          </button>
          <input
            #fileInput
            type="file"
            class="hidden"
            (change)="onFileSelected($event)"
            accept="image/jpeg,image/png"
          />
        }
      </div>

      <!-- Image Preview Modal -->
      @if (showPreviewModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Podgląd zdjęcia
              </h3>
              <button
                (click)="closePreviewModal()"
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ng-icon name="heroXMark" size="24" />
              </button>
            </div>
            <img
              [src]="previewUrl()"
              class="max-h-[600px] w-auto mx-auto"
              alt="Full Preview"
            />
          </div>
        </div>
      }

      <!-- Image Cropper Modal -->
      @if (showCropper()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Przytnij zdjęcie
              </h3>
              <button
                (click)="closeCropper()"
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ng-icon name="heroXMark" size="24" />
              </button>
            </div>

            <image-cropper
              [imageChangedEvent]="imageChangedEvent"
              [maintainAspectRatio]="true"
              [aspectRatio]="format() === 'circle' ? 1 : 1"
              [roundCropper]="format() === 'circle'"
              format="png"
              (imageCropped)="imageCropped($event)"
              (imageLoaded)="imageLoaded($event)"
              (loadImageFailed)="loadImageFailed()"
              class="max-h-[400px]"
            ></image-cropper>

            <div class="flex justify-end mt-4 space-x-3">
              <button
                (click)="closeCropper()"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Anuluj
              </button>
              <button
                (click)="save()"
                class="px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ImageComponent {
  private readonly injector = inject(Injector);
  private readonly baseUrl = environment.backendUrl;

  // Inputs
  mode = input<ImageMode>('view');
  format = input<ImageFormat>('circle');
  size = input<ImageSize>('md');
  initialUrl = input<string | null>(null);

  // Output - nowa składnia z signal
  imageSaved = output<{ file: File; preview: string | null }>();

  // State
  protected imageChangedEvent: Event | null = null;
  protected previewUrl = signal<string | null>(null);
  protected showCropper = signal(false);
  protected showPreviewModal = signal(false);
  private croppedImageBlob: string | null = null;

  constructor() {
    afterNextRender(() => {
      if (this.initialUrl()) {
        const url = this.initialUrl();
        this.previewUrl.set(url?.startsWith('/') ? `${this.baseUrl}${url}` : url);
      }

      runInInjectionContext(this.injector, () => {
        effect(() => {
          const url = this.initialUrl();
          if (url) {
            this.previewUrl.set(url.startsWith('/') ? `${this.baseUrl}${url}` : url);
          }
        });
      });
    });
  }

  protected getContainerClasses(): string {
    const sizeClasses = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32'
    };

    return `
      ${sizeClasses[this.size()]}
      ${this.format() === 'circle' ? 'rounded-full' : 'rounded-lg'}
      overflow-hidden
      bg-gray-200
      dark:bg-gray-700
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
      lg: '96'
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

  protected onFileSelected(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageChangedEvent = event;
      this.showCropper.set(true);
    }
  }

  protected imageCropped(event: ImageCroppedEvent): void {
    this.croppedImageBlob = event.base64 || null;
  }

  protected imageLoaded(image: LoadedImage): void {
    console.log('Image loaded', image);
  }

  protected loadImageFailed(): void {
    console.error('Load failed');
  }

  protected closeCropper(): void {
    this.showCropper.set(false);
    this.imageChangedEvent = null;
  }

  protected save(): void {
    if (this.croppedImageBlob && this.imageChangedEvent) {
      const originalFile = (this.imageChangedEvent.target as any).files[0] as File;
      fetch(this.croppedImageBlob)
        .then(res => res.blob())
        .then(blob => {
          const fileName = originalFile.name.replace(/\.[^/.]+$/, '') + '-cropped.png';
          const file = new File([blob], fileName, { type: 'image/png' });
          this.previewUrl.set(this.croppedImageBlob);
          // Emitowanie wartości używając nowej składni
          this.imageSaved.emit({ file, preview: this.croppedImageBlob });
          this.closeCropper();
        });
    }
  }
}
