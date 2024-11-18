import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LinkType } from '../../enums/link.enum';

@Component({
  selector: 'app-link',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <a
      [routerLink]="routerLink"
      routerLinkActive="font-bold"
      [ngClass]="{
        'text-black no-underline hover:no-underline': linkType === LinkType.Nav,
        'text-blue-500 underline hover:underline':
          linkType === LinkType.Default,
      }"
    >
      <ng-content></ng-content>
    </a>
  `,
})
export class LinkComponent {
  @Input() routerLink!: string | any[];
  @Input() linkType: LinkType = LinkType.Default;
  @Input() clickHandler?: () => void;

  protected readonly LinkType = LinkType;

  handleClick(): void {
    if (this.clickHandler) {
      this.clickHandler();
    }
  }
}
