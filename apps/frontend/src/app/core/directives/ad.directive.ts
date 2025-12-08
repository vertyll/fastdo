import { Directive, ViewContainerRef, inject } from '@angular/core';

@Directive({
  selector: '[appAdHost]',
})
export class AdDirective {
  public readonly viewContainerRef = inject(ViewContainerRef);
}
