import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateCompiler, provideTranslateService, TranslateService } from '@ngx-translate/core';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { describe, expect, it, beforeEach } from 'vitest';
import { LegalDocumentComponent } from './legal-document.component';

describe('LegalDocumentComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService(),
        provideTranslateCompiler(TranslateMessageFormatCompiler),
      ],
    });
    TestBed.inject(TranslateService).setTranslation('pl', {
      Legal: {
        title: 'Regulamin',
        sections: [
          { title: 'Kontakt', content: 'Napisz na kontakt@fastdo.dev.' },
          { title: 'Prawa', items: ['Dostęp', 'Usunięcie'] },
        ],
      },
    });
    TestBed.inject(TranslateService).use('pl');
  });

  it('renders every section although the message format compiler turns lists into objects', async () => {
    const fixture = TestBed.createComponent(LegalDocumentComponent);
    fixture.componentRef.setInput('titleKey', 'Legal.title');
    fixture.componentRef.setInput('sectionsKey', 'Legal.sections');
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect([...element.querySelectorAll('h2')].map(heading => heading.textContent?.trim())).toEqual([
      'Kontakt',
      'Prawa',
    ]);
    expect([...element.querySelectorAll('li')].map(item => item.textContent?.trim())).toEqual(['Dostęp', 'Usunięcie']);
    expect(element.querySelector('a')?.getAttribute('href')).toBe('mailto:kontakt@fastdo.dev');
  });
});
