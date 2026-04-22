import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filledFilter',
  pure: false,
})
export class FilledFilterPipe implements PipeTransform {
  private readonly ION_INPUT_NODE = 'ION-INPUT';
  private readonly NG_SELECT_NODE = 'NG-SELECT';
  private readonly NG_VALUE_LABEL_SELECTOR = '.ng-value-label';

  public transform(node: any, ..._args: unknown[]): any {
    if (!node) {
      return null;
    }

    switch (node.nodeName) {
      case this.ION_INPUT_NODE:
        return (node.firstChild as HTMLInputElement)?.value;

      case this.NG_SELECT_NODE:
        return Array.from(node.querySelectorAll(this.NG_VALUE_LABEL_SELECTOR)).map(
          (element: unknown) => (element as HTMLElement).innerText?.trim() || '',
        );

      default:
        return node.value;
    }
  }
}
