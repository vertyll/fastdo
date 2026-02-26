import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LinkTypeEnum } from '../../enums/link-type.enum';

@Component({
  selector: 'app-link',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <a
      [routerLink]="routerLink()"
      routerLinkActive="font-bold"
      [ngClass]="{
        'text-text-primary dark:text-dark-text-primary no-underline hover:no-underline':
          linkType() === LinkTypeEnum.Nav,
        'text-link-primary underline hover:text-link-hover dark:text-link-dark-primary dark:hover:text-link-dark-hover transition-colors duration-200':
          linkType() === LinkTypeEnum.Default,
      }"
    >
      <ng-content></ng-content>
    </a>
  `,
})
export class LinkComponent {
  readonly routerLink = input.required<string | any[]>();
  readonly linkType = input<LinkTypeEnum>(LinkTypeEnum.Default);
  readonly clickHandler = input<() => void>();

  protected readonly LinkTypeEnum = LinkTypeEnum;
}
