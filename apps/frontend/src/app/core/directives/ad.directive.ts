import { Directive, ViewContainerRef, inject } from '@angular/core';

@Directive({
    selector: '[adHost]',
    standalone: true
})
export class AdDirective {
  public readonly viewContainerRef = inject(ViewContainerRef);
}
