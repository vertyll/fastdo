import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SELECTED_LANGUAGE_KEY } from '../../app.constants';
import { LanguageService } from './language.service';
import { LocalStorageService } from './local-storage.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let document: Document;
  const use = vi.fn();
  const set = vi.fn();

  beforeEach(() => {
    use.mockClear();
    set.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: TranslateService, useValue: { use } },
        { provide: LocalStorageService, useValue: { set } },
      ],
    });
    service = TestBed.inject(LanguageService);
    document = TestBed.inject(DOCUMENT);
  });

  it('names the language it starts in on the page', () => {
    service.start('en');

    expect(document.documentElement.lang).toBe('en');
    expect(use).toHaveBeenCalledWith('en');
    expect(set).toHaveBeenCalledWith(SELECTED_LANGUAGE_KEY, 'en');
    expect(service.current()).toBe('en');
  });

  it('follows the language the reader chooses, and announces it', async () => {
    service.start('pl');
    const chosen = firstValueFrom(service.chosen$);

    service.choose('en');

    expect(document.documentElement.lang).toBe('en');
    expect(await chosen).toBe('en');
  });
});
