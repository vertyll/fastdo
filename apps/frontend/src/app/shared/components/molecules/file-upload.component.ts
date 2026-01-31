import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, input, output, signal } from '@angular/core';
import { provideIcons, NgIconComponent } from '@ng-icons/core';
import { heroDocument, heroTrash, heroXMark } from '@ng-icons/heroicons/outline';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../atoms/button.component';
import { ErrorMessageComponent } from '../atoms/error.message.component';

export interface FileUploadItem {
  file: File;
  preview: string;
  id?: string;
  originalName?: string;
  filename?: string;
  _markedForDelete?: boolean;
}

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule, NgIconComponent, TranslateModule, ButtonComponent, ErrorMessageComponent],
  viewProviders: [provideIcons({ heroDocument, heroTrash, heroXMark })],
  template: `
    <div class="space-y-4">
      <!-- File Input -->
      <div class="flex items-center gap-2">
        <app-button type="button" (click)="fileInput.click()" [disabled]="disabled()">
          {{ 'Basic.selectFiles' | translate }}
        </app-button>
        <input
          #fileInput
          type="file"
          [multiple]="multiple()"
          [accept]="accept()"
          (change)="onFileSelected($event)"
          class="hidden"
        />
        @if (maxFiles() > 0) {
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ 'Basic.maxFiles' | translate: { count: maxFiles() } }}
          </span>
        }
      </div>

      <!-- File List -->
      @if (files().length > 0) {
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ 'Basic.selectedFiles' | translate }}
          </h4>
          <div class="space-y-2">
            @for (fileItem of files(); track fileItem.file.name) {
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center gap-3">
                  <ng-icon name="heroDocument" class="w-5 h-5 text-blue-500" />
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ fileItem.file.name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatFileSize(fileItem.file.size) }}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="removeFile(fileItem)"
                  class="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                >
                  <ng-icon name="heroXMark" class="w-4 h-4" />
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Error Messages -->
      @if (errors().length > 0) {
        <div class="space-y-1">
          @for (error of errors(); track $index) {
            <app-error-message [customMessage]="error" />
          }
        </div>
      }

      <!-- File Size Limit Info -->
      @if (maxSizeBytes() > 0) {
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ 'Basic.maxFileSize' | translate: { size: formatFileSize(maxSizeBytes()) } }}
        </div>
      }
    </div>
  `,
})
export class FileUploadComponent {
  private readonly translate = inject(TranslateService);

  @ViewChild('fileInput', { static: true })
  fileInput!: ElementRef<HTMLInputElement>;

  multiple = input<boolean>(false);
  accept = input<string>('');
  maxFiles = input<number>(0);
  maxSizeBytes = input<number>(0);
  disabled = input<boolean>(false);

  filesChange = output<FileUploadItem[]>();
  errorOccurred = output<string[]>();

  files = signal<FileUploadItem[]>([]);
  errors = signal<string[]>([]);

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFiles = input.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    const newErrors: string[] = [];
    const validFiles: FileUploadItem[] = [];

    if (this.maxFiles() > 0 && this.files().length + selectedFiles.length > this.maxFiles()) {
      newErrors.push(this.translate.instant('Basic.maxFilesExceeded', { count: this.maxFiles() }));
    }

    Array.from(selectedFiles).forEach(file => {
      if (this.maxSizeBytes() > 0 && file.size > this.maxSizeBytes()) {
        newErrors.push(
          this.translate.instant('Basic.fileSizeExceeded', {
            name: file.name,
            size: this.formatFileSize(this.maxSizeBytes()),
          }),
        );
        return;
      }

      if (this.files().some(f => f.file.name === file.name && f.file.size === file.size)) {
        newErrors.push(this.translate.instant('Basic.fileDuplicate', { name: file.name }));
        return;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    });

    if (newErrors.length > 0) {
      this.errors.set(newErrors);
      this.errorOccurred.emit(newErrors);
    } else {
      this.errors.set([]);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...this.files(), ...validFiles];
      this.files.set(updatedFiles);
      this.filesChange.emit(updatedFiles);
    }

    input.value = '';
  }

  protected removeFile(fileItem: FileUploadItem): void {
    URL.revokeObjectURL(fileItem.preview);
    const updatedFiles = this.files().filter(f => f !== fileItem);
    this.files.set(updatedFiles);
    this.filesChange.emit(updatedFiles);
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public clearFiles(): void {
    this.files().forEach(fileItem => URL.revokeObjectURL(fileItem.preview));
    this.files.set([]);
    this.errors.set([]);
    this.filesChange.emit([]);
  }

  public setFiles(files: FileUploadItem[]): void {
    this.files.set(files);
    this.filesChange.emit(files);
  }
}
