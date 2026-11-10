import { Injectable } from '@angular/core';
import {
  InterpolatableTranslation,
  InterpolatableTranslationObject,
  InterpolateFunction,
  InterpolationParameters,
  StrictTranslation,
  TranslateCompiler,
  TranslationObject,
} from '@ngx-translate/core';
import { IntlMessageFormat } from 'intl-messageformat';

/**
 * Compiles catalogue messages written in ICU MessageFormat, with their `plural`, `select` and `number` arguments.
 *
 * FormatJS interprets a parsed message rather than generating code, so the page needs no `'unsafe-eval'` in its
 * Content Security Policy. Each message is parsed on first use and cached per language, and a message that cannot be
 * parsed or formatted is shown as written and reported on the console, so one broken entry never breaks a page.
 */
@Injectable()
export class IcuMessageCompiler extends TranslateCompiler {
  private readonly formats = new Map<string, Map<string, IntlMessageFormat | null>>();

  public compile(value: string, lang: string): InterpolateFunction {
    return params => this.format(value, lang, params);
  }

  public compileTranslations(translations: TranslationObject, lang: string): InterpolatableTranslationObject {
    return this.compileEntries(translations, lang);
  }

  // A list becomes an object keyed by its indexes, as it did with the earlier compiler.
  private compileEntries(
    translations: TranslationObject | readonly StrictTranslation[],
    lang: string,
  ): InterpolatableTranslationObject {
    return Object.fromEntries(
      Object.entries(translations).map(([key, value]) => [key, this.compileValue(value, lang)]),
    );
  }

  private compileValue(value: StrictTranslation, lang: string): InterpolatableTranslation {
    if (typeof value === 'string') {
      return this.compile(value, lang);
    }
    if (value !== null && typeof value === 'object') {
      return this.compileEntries(value, lang);
    }
    return value;
  }

  private format(message: string, lang: string, params: InterpolationParameters | undefined): string {
    const format = this.formatOf(message, lang);
    if (format === null) {
      return message;
    }
    try {
      const output = format.format(params);
      return Array.isArray(output) ? output.join('') : String(output);
    } catch (error) {
      console.error(`Could not format the ${lang} message "${message}":`, error);
      return message;
    }
  }

  private formatOf(message: string, lang: string): IntlMessageFormat | null {
    let byMessage = this.formats.get(lang);
    if (byMessage === undefined) {
      byMessage = new Map();
      this.formats.set(lang, byMessage);
    }
    let format = byMessage.get(message);
    if (format === undefined) {
      format = this.parse(message, lang);
      byMessage.set(message, format);
    }
    return format;
  }

  private parse(message: string, lang: string): IntlMessageFormat | null {
    try {
      // Tags are text here: a catalogue message never holds markup for FormatJS to turn into elements.
      return new IntlMessageFormat(message, lang, undefined, { ignoreTag: true });
    } catch (error) {
      console.error(`Could not parse the ${lang} message "${message}":`, error);
      return null;
    }
  }
}
