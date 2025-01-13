import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filledFilter',
  pure: false,
})
export class FilledFilterPipe implements PipeTransform {
  public transform(node: any, ..._args: unknown[]): any {
    switch (node.nodeName) {
      case 'ION-INPUT':
        return node.firstChild?.value;
      case 'NG-SELECT':
        let valueLabels: any = [];
        node.querySelectorAll('.ng-value-label').forEach((node: any) => {
          valueLabels.push(node.innerText.trim());
        });

        return valueLabels;
      default:
        return node.value;
    }
  }
}
