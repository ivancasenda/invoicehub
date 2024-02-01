import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { UtilsService } from '../utils/utils.service';
import { Invoice } from '../../models/invoice.model';


@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private readonly http: HttpClient) { }

  /**
   * Make GET request to get Invoice with specified id.
   * @param id 
   * @returns Observable of Invoice model from server.
   */
  getInvoice(id: string): any {
    return this.http.get(UtilsService.BACKEND_SERVER_URL+'/invoice/'+id);
  }

  /**
   * Make POST request to save newly created invoice.
   * @param invoice Invoice to be saved to server.
   * @returns Observable of saved Invoice model with id filled by server.
   */
  saveInvoice(invoice: Invoice): any {
    let invoiceJson = JSON.stringify(invoice);
    let headers:HttpHeaders =  new HttpHeaders({
      'Content-Type':  'application/json'
    })
    return this.http.post(UtilsService.BACKEND_SERVER_URL+'/invoice', invoiceJson, {headers});
  }

  /**
   * Make PUT request to update previously saved invoice with new data.
   * @param invoice new Invoice data to be send to server.
   * @returns Observable to be subscribe, server return void.
   */
  updateInvoice(invoice: Invoice): any {
    let invoiceJson = JSON.stringify(invoice);
    let headers:HttpHeaders =  new HttpHeaders({
      'Content-Type':  'application/json'
    })
    return this.http.put(UtilsService.BACKEND_SERVER_URL+'/invoice/'+invoice.id, invoiceJson, {headers});
  }

  /**
   * Make DELETE request to delete previously saved invoice with specified id.
   * @param id the id of invoice to be deleted.
   * @returns Observable to be subscribe, server return void.
   */
  deleteInvoice(id: string): any {
    return this.http.delete(UtilsService.BACKEND_SERVER_URL+'/invoice/'+id);
  }

  /**
   * Make POST request to send invoice data to be printed.
   * @param invoice Invoice data to be printed.
   */
  printInvoice(invoice: Invoice): any {
    let invoiceJson = JSON.stringify(invoice);
    let headers:HttpHeaders =  new HttpHeaders({
      'Content-Type':  'application/json'
    })
    let url: string = UtilsService.BACKEND_SERVER_URL;
    return this.http.post(url+'/invoice/print', invoiceJson, {headers: headers, responseType: 'arraybuffer'});
  }

  /**
   * Make GET request to check wether specified invoiceID is available to use.
   * @param invoiceID invoice id to be checked.
   * @returns Observable of boolean wether invoice id is available.
   */
  getInvoiceID(invoiceID: string): any {
    return this.http.get(UtilsService.BACKEND_SERVER_URL+'/invoice/available/'+invoiceID);
  }

  /**
   * Make GET request to generate new invoice id.
   * @returns Observable of invoice id string.
   */
  generateInvoiceID(): any {
    return this.http.get(UtilsService.BACKEND_SERVER_URL+'/invoice/generate-invoice-id');
  }

}
