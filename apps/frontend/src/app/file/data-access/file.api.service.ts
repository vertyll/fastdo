import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/defs/api-response.defs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { DownloadTicket, RequestUploadPayload, StoredFile, UploadTicket } from '../defs/file.defs';

const FILES = '/files';

@Injectable({
  providedIn: 'root',
})
export class FileApiService extends HttpApiService {
  public requestUpload(payload: RequestUploadPayload): Observable<ApiResponse<UploadTicket>> {
    return this.http.post<ApiResponse<UploadTicket>>(`${this.baseUrl}${FILES}/upload-ticket`, payload);
  }

  public confirmUpload(fileId: string): Observable<ApiResponse<StoredFile>> {
    return this.http.post<ApiResponse<StoredFile>>(`${this.baseUrl}${FILES}/${fileId}/confirm`, {});
  }

  public attach(fileId: string, scopeId: string): Observable<ApiResponse<StoredFile>> {
    return this.http.post<ApiResponse<StoredFile>>(`${this.baseUrl}${FILES}/${fileId}/attach`, { scopeId });
  }

  public getFile(fileId: string): Observable<ApiResponse<StoredFile>> {
    return this.http.get<ApiResponse<StoredFile>>(`${this.baseUrl}${FILES}/${fileId}`);
  }

  public requestDownload(fileId: string): Observable<ApiResponse<DownloadTicket>> {
    return this.http.get<ApiResponse<DownloadTicket>>(`${this.baseUrl}${FILES}/${fileId}/download-ticket`);
  }

  public delete(fileId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}${FILES}/${fileId}`);
  }
}
