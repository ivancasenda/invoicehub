import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { LazyLoadEvent } from 'primeng/api';
import { UtilsService } from '../utils/utils.service';
import { Observable, of } from 'rxjs';
import { Invoice } from '../../models/invoice.model';

/**
 * Provide http request service to search invoices on server api.
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private readonly http: HttpClient) { }

  /**
   * Make GET request to search invoice with search parameters.
   * @param searchParams search parameter to be send to server.
   * @returns list of invoice that match search parameters.
   */
  searchInvoice(searchParams: LazyLoadEvent): Observable<Invoice[]> {
    if (searchParams == null) return of(null);
    return <Observable<Invoice[]>> this.http.get(UtilsService.BACKEND_SERVER_URL + '/invoice/search', {params: this.getSearchParams(searchParams)}); 
  }

  /**
   * Make GET request get total found invoices with search parameters.
   * @param searchParams parameters to search saved invoice.
   * @returns number of invoices that match search parameters.
   */
  totalSearchInvoice(searchParams: LazyLoadEvent): Observable<number> {
    if (searchParams == null) return of(null);
    return <Observable<number>> this.http.get(UtilsService.BACKEND_SERVER_URL + '/invoice/search-found', {params: this.getTotalSearchParams(searchParams)}); 
  }

  /**
   * Construct HttpParams for invoice search request from search parameters
   * @param searchParams
   * @returns constructed HttpParams based on search parameters.
   */
  private getSearchParams(searchParams: LazyLoadEvent): HttpParams {
    let params = new HttpParams();

    let resultSize = searchParams.rows;
    let firstRow = searchParams.first;
    let sortField = searchParams.sortField;
    let sortOrder = searchParams.sortOrder;

    params = params
      .set('resultSize', resultSize.toString())
      .set('firstRow', firstRow.toString())
      .set('sortField', sortField)
      .set('sortOrder', sortOrder.toString())

    return this.getFilterParams(searchParams, params);
  }

  /**
   * Construct HttpParams for total search request based on search parameters.
   * @param searchParams 
   * @returns constructed HttpParams based on search parameters.
   */
  private getTotalSearchParams(searchParams: LazyLoadEvent): HttpParams {
    return this.getFilterParams(searchParams, new HttpParams());
  }

  /**
   * Add additional search parameters to HttpParams.
   * @param searchParams 
   * @param params 
   * @returns a copy of HttpParams with added search parameters.
   */
  private getFilterParams(searchParams: LazyLoadEvent, params: HttpParams): HttpParams {
    let globalFilter = searchParams.globalFilter;
    let invoiceID = searchParams.filters.invoiceID;
    let storeName = searchParams.filters.storeName;
    let datetimeFrom = searchParams.filters.datetimeFrom;
    let datetimeTo = searchParams.filters.datetimeTo;

    if (globalFilter != null) {
      params = params.set('globalFilter', globalFilter);
    }
    if (invoiceID != null) {
      params = params.set('invoiceID', invoiceID.value);
    }
    if (storeName != null) {
      params = params.set('storeName', storeName.value);
    }
    if (datetimeFrom != null) {
      params = params.set('datetimeFrom', datetimeFrom.value.toISOString());
    }
    if (datetimeTo != null) {
      let datetimeToValue:Date = datetimeTo.value;
      datetimeToValue.setDate(datetimeToValue.getDate() + 1);
      datetimeToValue.setHours(0,0,0,0);
      params = params.set('datetimeTo', datetimeToValue.toISOString());
    }

    return params;
  }

}
