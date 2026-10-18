import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ImageSource } from '../../shared/services/image-source';
import { FileApiService } from './file.api.service';

@Injectable({
  providedIn: 'root',
})
export class FileImageSource extends ImageSource {
  private readonly fileApi = inject(FileApiService);

  public urlOf(fileId: string): Observable<string> {
    return this.fileApi.requestDownload(fileId).pipe(map(ticket => ticket.downloadUrl));
  }
}
