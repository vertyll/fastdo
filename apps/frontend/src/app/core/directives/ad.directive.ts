import { Directive, ViewContainerRef, inject } from '@angular/core';

@Directive({
  selector: '[adHost]',
})
export class AdDirective {
  public readonly viewContainerRef = inject(ViewContainerRef);
}
