import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'error',
  standalone: true,
})
export class ErrorPipe implements PipeTransform {
  public transform(value: any, ...args: any[]): any {
    return value ? Object.keys(value) : value;
  }
}
