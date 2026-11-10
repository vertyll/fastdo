import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateCompiler, provideTranslateService, TranslateService } from '@ngx-translate/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IcuMessageCompiler } from './icu-message.compiler';

// Messages as the catalogues hold them; the expected texts are what the earlier messageformat compiler rendered.
const POLISH = {
  Basic: {
    maxFiles: 'Maksymalnie {count, plural, one{# plik} few{# pliki} many{# plików} other{# pliku}}',
    fileDuplicate: 'Plik "{name}" jest już wybrany',
  },
  FormValidationMessage: {
    minLength:
      'To pole musi mieć co najmniej {minLength, plural, one{# znak} few{# znaki} many{# znaków} other{# znaku}}',
  },
  Task: {
    batchDeleteConfirm:
      'Czy na pewno chcesz usunąć {count, plural, one{# zadanie} few{# zadania} many{# zadań} other{# zadania}}?',
  },
  project: {
    members: '{count, plural, one{# członek} few{# członkowie} many{# członków} other{# członka}}',
  },
  Profile: {
    updated:
      '{gender, select, female {Zaktualizowała profil} male {Zaktualizował profil} other {Zaktualizowano profil}}',
  },
  Legal: {
    sections: [{ title: 'Kontakt' }, { title: "Autor's ''notes''" }],
  },
};

const ENGLISH = {
  Basic: {
    maxFiles: 'Max {count, plural, one{# file} other{# files}}',
  },
  Task: {
    batchDeleteSuccess: 'Successfully deleted {count, plural, one{# task} other{# tasks}}',
  },
  Profile: {
    updated: '{gender, select, female {She} male {He} other {They}} updated the profile',
  },
};

describe('IcuMessageCompiler', () => {
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService(),
        provideTranslateCompiler(IcuMessageCompiler),
      ],
    });
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('pl', POLISH);
    translate.setTranslation('en', ENGLISH);
  });

  afterEach(() => vi.restoreAllMocks());

  it('chooses each of the four Polish plural forms', () => {
    translate.use('pl');

    const maxFiles = (count: number): string => translate.instant('Basic.maxFiles', { count });

    expect(maxFiles(1)).toBe('Maksymalnie 1 plik');
    expect(maxFiles(2)).toBe('Maksymalnie 2 pliki');
    expect(maxFiles(5)).toBe('Maksymalnie 5 plików');
    expect(maxFiles(22)).toBe('Maksymalnie 22 pliki');
    expect(maxFiles(1.5)).toBe('Maksymalnie 1,5 pliku');
    expect(translate.instant('FormValidationMessage.minLength', { minLength: 8 })).toBe(
      'To pole musi mieć co najmniej 8 znaków',
    );
    expect(translate.instant('Task.batchDeleteConfirm', { count: 3 })).toBe('Czy na pewno chcesz usunąć 3 zadania?');
    expect(translate.instant('project.members', { count: 12 })).toBe('12 członków');
  });

  it('formats the number a plural stands for in the language', () => {
    translate.use('pl');
    expect(translate.instant('Basic.maxFiles', { count: 12345 })).toBe('Maksymalnie 12 345 plików');

    translate.use('en');
    expect(translate.instant('Basic.maxFiles', { count: 1000 })).toBe('Max 1,000 files');
  });

  it('chooses the two English plural forms', () => {
    translate.use('en');

    expect(translate.instant('Basic.maxFiles', { count: 1 })).toBe('Max 1 file');
    expect(translate.instant('Basic.maxFiles', { count: 2 })).toBe('Max 2 files');
    expect(translate.instant('Task.batchDeleteSuccess', { count: 1 })).toBe('Successfully deleted 1 task');
  });

  it('chooses a select branch, and other for a value it does not name', () => {
    translate.use('pl');
    expect(translate.instant('Profile.updated', { gender: 'female' })).toBe('Zaktualizowała profil');
    expect(translate.instant('Profile.updated', { gender: 'male' })).toBe('Zaktualizował profil');
    expect(translate.instant('Profile.updated', { gender: 'unknown' })).toBe('Zaktualizowano profil');

    translate.use('en');
    expect(translate.instant('Profile.updated', { gender: 'other' })).toBe('They updated the profile');
  });

  it('replaces a simple argument and keeps apostrophes as ICU quotes them', () => {
    translate.use('pl');

    expect(translate.instant('Basic.fileDuplicate', { name: 'raport.pdf' })).toBe('Plik "raport.pdf" jest już wybrany');
    expect(translate.instant('Legal.sections.1.title')).toBe("Autor's 'notes'");
  });

  it('turns a list into an object keyed by its indexes', () => {
    translate.use('pl');

    expect(Object.keys(translate.instant('Legal.sections'))).toEqual(['0', '1']);
    expect(translate.instant('Legal.sections.0.title')).toBe('Kontakt');
  });

  it('shows a message that cannot be parsed as written', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const message = new IcuMessageCompiler().compile('{count, plural, one{# plik}', 'pl');

    expect(message({ count: 1 })).toBe('{count, plural, one{# plik}');
    expect(errors).toHaveBeenCalledOnce();
  });

  it('shows a message as written when its argument is missing', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const message = new IcuMessageCompiler().compile('Plik "{name}"', 'pl');

    expect(message()).toBe('Plik "{name}"');
    expect(errors).toHaveBeenCalledOnce();
  });

  it('parses a message once per language', () => {
    const compiler = new IcuMessageCompiler();
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const broken = compiler.compile('{', 'pl');

    broken();
    broken();
    compiler.compile('{', 'pl')();
    expect(errors).toHaveBeenCalledOnce();

    compiler.compile('{', 'en')();
    expect(errors).toHaveBeenCalledTimes(2);
  });
});
