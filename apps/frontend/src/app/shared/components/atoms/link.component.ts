import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LinkType } from '../../enums/link.enum';

@Component({
    selector: 'app-link',
    imports: [RouterLink, RouterLinkActive, CommonModule],
    template: `
    <a
      [routerLink]="routerLink()"
      routerLinkActive="font-bold"
      [ngClass]="{
        'text-black no-underline hover:no-underline': linkType() === LinkType.Nav,
        'text-blue-500 underline hover:underline':
          linkType() === LinkType.Default,
      }"
    >
      <ng-content></ng-content>
    </a>
  `
})
export class LinkComponent {
  readonly routerLink = input.required<string | any[]>();
  readonly linkType = input<LinkType>(LinkType.Default);
  readonly clickHandler = input<() => void>();

  protected readonly LinkType = LinkType;
}
