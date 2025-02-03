import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, WritableSignal, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCamera, heroUserCircle } from '@ng-icons/heroicons/outline';
import { ImageCroppedEvent, ImageCropperComponent as NgxImageCropperComponent, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [CommonModule, NgxImageCropperComponent, NgIconComponent],
  providers: [provideIcons({ heroCamera, heroUserCircle })],
  template: `
    <div class="relative">
      @if (mode() === 'edit') {
        <div class="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          @if (previewUrl()) {
            <img [src]="previewUrl()" class="w-full h-full object-cover" alt="Preview" />
          } @else {
            <ng-icon name="heroUserCircle" size="64" class="text-gray-500" />
          }
          <button
            class="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg"
            (click)="fileInput.click()"
          >
            <ng-icon name="heroCamera" size="20" class="text-gray-700 dark:text-gray-300" />
          </button>
          <input
            #fileInput
            type="file"
            class="hidden"
            (change)="onFileSelected($event)"
            accept="image/jpeg,image/png"
          />
        </div>

        @if (showCropper()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Przytnij zdjęcie</h3>
                <button (click)="closeCropper()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">×</button>
              </div>

              <image-cropper
                [imageChangedEvent]="imageChangedEvent"
                [maintainAspectRatio]="true"
                [aspectRatio]="1"
                [roundCropper]="true"
                format="png"
                (imageCropped)="imageCropped($event)"
                (imageLoaded)="imageLoaded($event)"
                (loadImageFailed)="loadImageFailed()"
                class="max-h-[400px]"
              ></image-cropper>

              <div class="flex justify-end mt-4 space-x-3">
                <button (click)="closeCropper()" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                  Anuluj
                </button>
                <button (click)="save()" class="px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors">
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          @if (previewUrl()) {
            <img [src]="previewUrl()" class="w-full h-full object-cover" alt="Preview" />
          } @else {
            <ng-icon name="heroUserCircle" size="64" class="text-gray-500" />
          }
        </div>
      }
    </div>
  `,
})
export class ImageComponent {
  protected readonly mode: WritableSignal<'edit' | 'preview'> = signal<'edit' | 'preview'>('edit');
  @Output()
  imageSaved = new EventEmitter<{ file: File; preview: string; }>();

  protected imageChangedEvent: Event | null = null;
  protected previewUrl = signal<string | null>(null);
  protected showCropper = signal(false);
  private croppedImageBlob: string | null = null;

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageChangedEvent = event;
      this.previewUrl.set(URL.createObjectURL(file));
      this.showCropper.set(true);
    }
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImageBlob = event.base64 || null;
  }

  imageLoaded(image: LoadedImage): void {
    console.log('Image loaded', image);
  }

  loadImageFailed(): void {
    console.error('Load failed');
  }

  closeCropper(): void {
    this.showCropper.set(false);
    this.imageChangedEvent = null;
  }

  save(): void {
    if (this.croppedImageBlob && this.imageChangedEvent) {
      const originalFile = (this.imageChangedEvent.target as any).files[0] as File;
      fetch(this.croppedImageBlob)
        .then(res => res.blob())
        .then(blob => {
          const fileName = originalFile.name.replace(/\.[^/.]+$/, '') + '-cropped.png';
          const file = new File([blob], fileName, { type: 'image/png' });
          this.imageSaved.emit({ file, preview: this.croppedImageBlob! });
          this.closeCropper();
        });
    }
  }
}
