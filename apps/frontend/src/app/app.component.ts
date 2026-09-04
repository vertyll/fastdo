import { Component } from '@angular/core';
import { ModalComponent } from './shared/components/organisms/modal.component';
import { LayoutComponent } from './shared/components/templates/layout.component';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent, ModalComponent],
  template: `
    <app-layout>
      <app-modal />
    </app-layout>
  `,
})
export class AppComponent {}
