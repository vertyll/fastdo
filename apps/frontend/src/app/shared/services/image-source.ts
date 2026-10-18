import { Observable } from 'rxjs';

/**
 * Where the image component finds the address of a stored image. Shared code knows no feature, so the feature that
 * stores files provides this, in the application's providers.
 */
export abstract class ImageSource {
  /** A short-lived address the browser can show the image at. */
  public abstract urlOf(fileId: string): Observable<string>;
}
