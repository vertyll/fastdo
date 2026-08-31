import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { FileScopeEnum, StoredFile } from '../defs/file.defs';
import { FileApiService } from './file.api.service';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private readonly fileApiService = inject(FileApiService);
  private readonly http = inject(HttpClient);

  public upload(file: File, scope: FileScopeEnum, scopeId?: string): Observable<StoredFile> {
    return this.fileApiService
      .requestUpload({
        originalName: file.name,
        contentType: file.type,
        declaredSizeBytes: file.size,
        scope,
        scopeId: scopeId ?? null,
      })
      .pipe(
        map(response => response.data),
        switchMap(ticket =>
          this.http
            .put(ticket.uploadUrl, file, { headers: { 'Content-Type': file.type }, withCredentials: false })
            .pipe(switchMap(() => this.fileApiService.confirmUpload(ticket.fileId))),
        ),
        map(response => response.data),
      );
  }
}
