import { AbstractControl, ValidationErrors } from '@angular/forms';
import { switchMap, map, first, delay } from 'rxjs/operators';
import { InvoiceService } from '../../services/invoice/invoice.service';

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UtilsService } from '../../services/utils/utils.service';

/**
 * Async Validation for invoice id input field.
 */
@Injectable({
  providedIn: 'root'
})
export class InvoiceIdValidator{

    constructor(private invoiceService: InvoiceService) {}
    
    /**
     * Validate invoice id, check to server if invoice id is available.
     * @param invoiceID invoice id to be check.
     */
    validate(invoiceID: string) {
        return (control: AbstractControl): Observable<ValidationErrors> | null => {
            let invoiceIdFormValue: string = UtilsService.removeUnderscore(control.value);
            if (control.pristine) {
                return of(null);
            } else if(invoiceID != null && invoiceIdFormValue == invoiceID) {
                return of(null);
            } else {
                return control.valueChanges.pipe(
                    switchMap((value: string) => {
                        value = UtilsService.removeUnderscore(value);
                        return this.invoiceService.getInvoiceID(value);
                    }),
                    map((result:boolean) => result ? null : {'invoiceIdAvailable': false}),
                    first()
                )
            }
        }
    }
}
