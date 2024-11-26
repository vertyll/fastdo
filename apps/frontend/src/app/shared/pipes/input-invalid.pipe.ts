import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({
  name: 'inputInvalid',
  pure: false,
  standalone: true,
})
export class InputInvalidPipe implements PipeTransform {
  public transform(value: AbstractControl | null, ..._args: unknown[]): string {
    return value?.invalid && (value.dirty || value.touched) ? 'has-error' : '';
  }
}
