import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Fonction permettant de valider une image selon les critères suivants (à compléter au besoin) :
 * - type (png, jpg, jpeg)
 */
export function imageValidator(): ValidatorFn {

    return (control: AbstractControl) => {
        if (!/\.jpg$/i.test(control.value) && !/\.png$/i.test(control.value)
            && !/\.jpeg$/i.test(control.value) && control.value !== undefined && control.value !== '' && control.value !== null) {
            return {
                invalid: {
                    reason: 'Type incorrect'
                }
            };
        }

        return null;
    };
}
