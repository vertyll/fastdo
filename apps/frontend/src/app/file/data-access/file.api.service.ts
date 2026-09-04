import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpApiService } from '../../shared/services/http-api.service';
import { DownloadTicket, RequestUploadPayload, StoredFile, UploadTicket } from '../defs/file.defs';

const FILES = '/files';

@Injectable({
  providedIn: 'root',
})
export class FileApiService extends HttpApiService {
  public requestUpload(payload: RequestUploadPayload): Observable<UploadTicket> {
    return this.http.post<UploadTicket>(`${this.baseUrl}${FILES}/upload-ticket`, payload);
  }

  public confirmUpload(fileId: string): Observable<StoredFile> {
    return this.http.post<StoredFile>(`${this.baseUrl}${FILES}/${fileId}/confirm`, {});
  }

  public attach(fileId: string, scopeId: string): Observable<StoredFile> {
    return this.http.post<StoredFile>(`${this.baseUrl}${FILES}/${fileId}/attach`, { scopeId });
  }

  public getFile(fileId: string): Observable<StoredFile> {
    return this.http.get<StoredFile>(`${this.baseUrl}${FILES}/${fileId}`);
  }

  public requestDownload(fileId: string): Observable<DownloadTicket> {
    return this.http.get<DownloadTicket>(`${this.baseUrl}${FILES}/${fileId}/download-ticket`);
  }

  public delete(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${FILES}/${fileId}`);
  }
}
