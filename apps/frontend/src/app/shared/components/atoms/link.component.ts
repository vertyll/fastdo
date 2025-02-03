import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LinkTypeEnum } from '../../enums/link.enum';

@Component({
  selector: 'app-link',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <a
      [routerLink]="routerLink()"
      routerLinkActive="font-bold"
      [ngClass]="{
        'text-black no-underline hover:no-underline': linkType() === LinkType.Nav,
        'text-blue-500 underline hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200':
          linkType() === LinkType.Default,
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

  protected readonly LinkType = LinkTypeEnum;
}
