import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { SELECTED_LANGUAGE_KEY } from '../../app.constants';
import { LocalStorageService } from './local-storage.service';

/**
 * The language FastDo shows, kept here as soon as it is set, so it holds while its translations load or when they fail
 * to, and the language the reader picks, announced to whoever keeps it elsewhere.
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translateService = inject(TranslateService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly language = signal<string | null>(null);
  private readonly chosenSubject = new Subject<string>();

  /** Each language the reader picks, and only those: not the one FastDo starts in. */
  public readonly chosen$: Observable<string> = this.chosenSubject.asObservable();

  /** Shows FastDo in this language, and keeps it for the next visit. */
  public start(language: string): void {
    this.language.set(language);
    this.translateService.use(language);
    this.localStorageService.set(SELECTED_LANGUAGE_KEY, language);
  }

  public choose(language: string): void {
    this.start(language);
    this.chosenSubject.next(language);
  }

  /** The language FastDo shows, which start-up sets before anything can ask for it. */
  public current(): string {
    const language = this.language();
    if (language === null) {
      throw new Error('FastDo starts in a language before anything reads it');
    }
    return language;
  }
}
