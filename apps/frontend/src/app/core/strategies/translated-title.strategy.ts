import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private lastKey: string | null = null;

  constructor(
    private readonly titleService: Title,
    private readonly translateService: TranslateService,
  ) {
    super();
    this.translateService.onLangChange.subscribe(() => {
      if (this.lastKey) {
        this.applyTitle(this.lastKey);
      }
    });
  }

  public override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.lastKey = key ?? null;
    if (key) {
      this.applyTitle(key);
    }
  }

  private applyTitle(key: string): void {
    const translated = this.translateService.instant(key);
    this.titleService.setTitle(translated || key);
  }
}
