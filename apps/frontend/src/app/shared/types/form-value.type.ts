import { FormGroup } from '@angular/forms';

/*
 * Type
 */
export type FormValue<T extends FormGroup> = ReturnType<T['getRawValue']>;
