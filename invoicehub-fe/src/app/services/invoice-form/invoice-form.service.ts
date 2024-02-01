import { Injectable } from '@angular/core';

import { Invoice } from '../../models/invoice.model';
import { Item } from '../../models/item.model';
import { InvoiceService } from '../invoice/invoice.service'
import { InvoiceIdValidator } from '../../validators/invoice-id/invoice-id-validator';

import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UtilsService } from '../utils/utils.service';

/**
 * Provide services to construct invoice reactive form.
 */
@Injectable({
  providedIn: 'root'
})
export class InvoiceFormService {

  constructor(
    private readonly formBuilder: FormBuilder, 
    private invoiceService: InvoiceService,
    private invoiceIdValidator: InvoiceIdValidator) { }

  /**
   * Retrieve data and create invoice reactive form based on id
   * @param id the id of invoice model.
   * @returns invoice form with no data (blank) if id equals null or empty
   * else return invoice form filled with data retrieve from server.
   */
  getInvoiceForm(id: string): Observable<FormGroup> {
    if (id == null || id.length == 0) {
      return of(this.getBlankInvoiceForm());
    }
    return this.invoiceService.getInvoice(id).pipe(
      map((apiResponse:Invoice) => this.generateInvoiceForm(apiResponse))
    );
  }

  /**
   * Get a blank item reactive form.
   * @returns item reactive form with field set to null.
   */
  getBlankItemForm(): FormGroup {
    let item:Item = {
      id: null,
      quantity: null,
      unit: null,
      itemName: null,
      price: null
    }
    return this.generateItemForm(item);
  }

  toCapitalLetter(sentence: string): string {
    if (sentence) {
        return sentence.toUpperCase();
    }
    return sentence;
  }

  /**
   * Create Invoice model based on data on invoice reactive form.
   * @param invoiceForm invoice reactive form it's data will be extracted.
   * @returns Invoice model with data filled from invoice form.
   */
  convertInvoiceFormToInvoice(invoiceForm: FormGroup): Invoice {
    return {
      id: invoiceForm.get('id').value,
      invoiceID: UtilsService.removeUnderscore(invoiceForm.get('invoiceID').value),
      datetime: invoiceForm.get('datetime').value.toISOString(),
      storeName: invoiceForm.get('storeName').value,
      invoiceNote: this.toCapitalLetter(invoiceForm.get('invoiceNote').value),
      items: invoiceForm.get('items').value.map((itemForm) => this.convertItemFormToItem(itemForm))
    }
  }

  /**
   * Get a blank invoice reactive form.
   * @returns invoice reactive form with datetime set to current, 
   * empty items array and other to null.
   */
  private getBlankInvoiceForm(): FormGroup {
    let invoice:Invoice = {
      id: null,
      invoiceID: null,
      datetime: new Date().toISOString().slice(0, -1) ,
      storeName: null,
      invoiceNote: null,
      items: []
    }
    return this.generateInvoiceForm(invoice);
  }

  /**
   * Create Item model based on data on item reactive form.
   * @param itemForm item reactive form it's data will be extracted.
   * @returns Item model with data filled from item form.
   */
  private convertItemFormToItem(itemForm): Item {
    return {
      id: itemForm.id,
      quantity: UtilsService.parseDecimal(itemForm.quantity),
      unit: itemForm.unit,
      itemName: this.toCapitalLetter(itemForm.itemName),
      price: UtilsService.parseDecimal(itemForm.price)
    }
  }

  /**
   * Construct invoice reactive form with data filled from Invoice model
   * and validators added
   * - invoiceID required, with pattern ^[a-zA-Z]{3}-[0-9_]{1,13}$ and async validation to server.
   * - datetime required.
   * @param invoice Invoice data model to be put in invoice form.
   * @returns constructed invoice reactive form filled with data from Invoice model.
   */
  private generateInvoiceForm(invoice: Invoice): FormGroup {
    return this.formBuilder.group({
      id: invoice.id,
      invoiceID: [invoice.invoiceID,{ validators: [Validators.required, Validators.pattern("^[a-zA-Z]{3}-[0-9_]{1,13}$")], updateOn: 'blur', asyncValidators: [this.invoiceIdValidator.validate(invoice.invoiceID)]}],
      datetime: [new Date(invoice.datetime + 'Z'), [Validators.required]],
      storeName: [invoice.storeName],
      invoiceNote: [invoice.invoiceNote],
      items: this.formBuilder.array(invoice.items.map((item:Item) => this.generateItemForm(item)))
    })
  }

  /**
   * Construct item reactive form with data filled from Item model
   * and quantity and price in indoensian locale number string format.
   * @param item Item data model to be put in invoice form.
   * @returns constructed item reactive form filled with data from Item model
   */
  private generateItemForm(item: Item): FormGroup {
    return this.formBuilder.group({
      id: item.id,
      quantity: [item.quantity == null ? null : item.quantity.toLocaleString('id')],
      unit: [item.unit],
      itemName: [item.itemName],
      price: [item.price == null ? null : item.price.toLocaleString('id')]
    })
  }
}
