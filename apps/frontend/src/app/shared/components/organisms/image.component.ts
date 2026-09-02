import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCamera, heroEye, heroUserCircle, heroXMark } from '@ng-icons/heroicons/outline';
import { TranslatePipe } from '@ngx-translate/core';
import Cropper from 'cropperjs';
import { ButtonComponent } from 'src/app/shared/components/atoms/button.component';
import { environment } from 'src/environments/environment';
import { FileApiService } from '../../../file/data-access/file.api.service';

export type ImageMode = 'view' | 'preview' | 'edit';
export type ImageFormat = 'circle' | 'square';
export type ImageSize = 'sm' | 'md' | 'lg';

const CROPPER_TEMPLATE =
  '<cropper-canvas>' +
  '<cropper-image rotatable scalable skewable translatable></cropper-image>' +
  '<cropper-shade hidden></cropper-shade>' +
  '<cropper-handle action="select" plain></cropper-handle>' +
  '<cropper-selection aspect-ratio="1" initial-coverage="1" movable resizable>' +
  '<cropper-grid role="grid" bordered covered></cropper-grid>' +
  '<cropper-crosshair centered></cropper-crosshair>' +
  '<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>' +
  '<cropper-handle action="n-resize"></cropper-handle>' +
  '<cropper-handle action="e-resize"></cropper-handle>' +
  '<cropper-handle action="s-resize"></cropper-handle>' +
  '<cropper-handle action="w-resize"></cropper-handle>' +
  '<cropper-handle action="ne-resize"></cropper-handle>' +
  '<cropper-handle action="nw-resize"></cropper-handle>' +
  '<cropper-handle action="se-resize"></cropper-handle>' +
  '<cropper-handle action="sw-resize"></cropper-handle>' +
  '</cropper-selection>' +
  '</cropper-canvas>';

@Component({
  selector: 'app-image',
  imports: [CommonModule, NgIconComponent, TranslatePipe, ButtonComponent],
  providers: [provideIcons({ heroCamera, heroUserCircle, heroEye, heroXMark })],
  template: `
    <div class="relative">
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
            <ng-icon name="heroCamera" size="18" class="text-text-primary dark:text-dark-text-primary" />
          </button>
          @if (previewUrl()) {
            <button
              class="absolute flex bottom-3 right-13 bg-red-500 hover:bg-red-600 rounded-full p-2 shadow-md  transition-colors duration-200"
              (click)="$event.preventDefault(); $event.stopPropagation(); removeImage()"
              [attr.aria-label]="'Image.removeImage' | translate"
              [title]="'Image.removeImage' | translate"
            >
              <ng-icon name="heroXMark" size="18" class="text-white" />
            </button>
          }
        }
        <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)" accept="image/jpeg,image/png" />
      </div>

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

      @if (showCropper()) {
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          [class.cropper-format-circle]="format() === 'circle'"
        >
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
              <app-button (click)="closeCropper()" [attr.aria-label]="'Basic.cancel' | translate" variant="stroked">
                {{ 'Basic.cancel' | translate }}
              </app-button>
              <app-button
                (click)="save()"
                [disabled]="isSaving()"
                [attr.aria-label]="isSaving() ? ('Basic.saving' | translate) : ('Basic.save' | translate)"
              >
                {{ isSaving() ? ('Basic.saving' | translate) : ('Basic.save' | translate) }}
              </app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      cropper-canvas {
        display: block;
        width: 100%;
        height: 100%;
      }

      .cropper-format-circle cropper-selection {
        border-radius: 50%;
        overflow: hidden;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ImageComponent implements OnDestroy {
  private readonly baseUrl = environment.apiUrl;
  private readonly fileApi = inject(FileApiService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly mode = input<ImageMode>('view');
  public readonly format = input<ImageFormat>('circle');
  public readonly size = input<ImageSize>('md');
  public readonly initialUrl = input<string | null>(null);
  public readonly fileId = input<string | null>(null);

  public readonly imageSaved = output<{ file: File; preview: string | null }>();
  public readonly croppingChange = output<boolean>();
  public readonly imageRemoved = output<void>();

  protected previewUrl = signal<string | null>(null);
  protected showCropper = signal(false);
  protected showPreviewModal = signal(false);
  protected tempImageUrl = signal<string | null>(null);
  protected isSaving = signal(false);

  private cropper: Cropper | null = null;
  private selectedFile: File | null = null;

  @ViewChild('fileInput')
  public readonly fileInput!: ElementRef<HTMLInputElement>;

  @ViewChild('cropperImage')
  public set cropperImage(element: ElementRef<HTMLImageElement>) {
    if (element && this.showCropper()) {
      if (this.cropper) {
        this.cropper.destroy();
      }

      this.cropper = new Cropper(element.nativeElement, { template: CROPPER_TEMPLATE });
    }
  }

  constructor() {
    effect(() => this.handleInitialUrlChange());
    effect(() => this.handleFileIdChange());
    effect(() => this.handleCroppingChange());
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

    return url.startsWith('http') ? url : `${this.baseUrl}/${url.replace(/^\//, '')}`;
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

      const selection = this.cropper.getCropperSelection();
      if (!selection) return;

      const canvas = await selection.$toCanvas();
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

  private handleFileIdChange(): void {
    const fileId = this.fileId();
    if (!fileId) return;

    this.fileApi
      .requestDownload(fileId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: response => this.previewUrl.set(response.data.downloadUrl) });
  }

  private handleInitialUrlChange(): void {
    const url = this.initialUrl();
    if (url) {
      this.previewUrl.set(this.getFullImageUrl(url));
    }
  }

  private handleCroppingChange(): void {
    this.croppingChange.emit(this.showCropper());
  }
}
