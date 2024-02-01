import { Component, OnInit,  ChangeDetectionStrategy, ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { tap, switchMap, take } from 'rxjs/operators';

import { MessageService, ConfirmationService } from 'primeng/api';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table'

import { Invoice } from '../../models/invoice.model';
import { SearchService } from '../../services/search/search.service';
import { UtilsService } from '../../services/utils/utils.service';
import { InvoiceService } from 'src/app/services/invoice/invoice.service';
import { tableRowAnimation } from '../../animations/table-row.animation';

import { registerLocaleData } from '@angular/common';
import locales from '@angular/common/locales/id'

/**
 * Provide component for /invoice/search page.
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [MessageService,ConfirmationService],
  animations: [tableRowAnimation.animate],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit, OnDestroy {
  private static readonly WINDOW_TITLE: string = "Find Invoice";
  private static readonly NUM_OF_SORT_MODE: number = 3;
  readonly FILTER_DELAY: number = 300;
  
  private searchParams: Subject<LazyLoadEvent> = new Subject;
  @ViewChild('dt') private table: Table;
  private searchChanged = false;

  searchResult: Observable<Invoice[]>;
  totalRecords: Observable<number>;
  loading: boolean;
  idDateLocale: any;
  sortField: string = 'datetime';
  sortOrder: number = 1;

  constructor( 
    private searchService: SearchService,
    private invoiceService: InvoiceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle(SearchComponent.WINDOW_TITLE);
    registerLocaleData(locales, 'id');

    this.initSearch();
  }

  /**
   * Called by primeng table, when filter, pagination, and etc changed.
   * @param event LazyLoadEvent containing result size, pagination, filter, sort field, sort order, and etc. 
   */
  loadInvoice(event: LazyLoadEvent): void {
    if (this.searchChanged == true) {
      event.sortOrder = 0;
      this.sortOrder = 0;
      this.searchChanged = false;
    }
    this.loading = true;
    this.searchParams.next(event);
  }

  /**
   * Set sort field and sort order back to default datetime and desc
   * and call primeng table to reload invoice. 
   */
  refresh(): void {
    //this.table.filters = {};
    this.sortField = 'datetime'; 
    this.sortOrder = 1;
    this.table.sortField = this.sortField;
    this.table.sortOrder = this.sortOrder;
    this.table._filter();
  }

  /**
   * Used by primeng table to improve performance by returning unique inovice identity.
   * @param index 
   * @param invoice 
   * @returns invoice id
   */
  trackItemById(index: number, invoice: Invoice): number {
    return invoice.id
  }

  /**
   * Sort table data by specified column and toggle sort order.
   * @param column table column to be sorted and toggle sort order.
   */
  sortToggle(column: string): void {
    if (column == 'invoiceID') {
      if(this.sortField != 'invoiceID'){
        this.sortField = 'invoiceID'; 
        this.sortOrder = 0;
      }
      this.sortOrder = (this.sortOrder + 1) % SearchComponent.NUM_OF_SORT_MODE;
      this.table.sortField = this.sortField;
      this.table.sortOrder = this.sortOrder;
    } else if(column == 'storeName') {
      if (this.sortField != 'storeName') {
        this.sortField = 'storeName'; 
        this.sortOrder = 0;
      }
      this.sortOrder = (this.sortOrder + 1) % SearchComponent.NUM_OF_SORT_MODE;
      this.table.sortField = this.sortField;
      this.table.sortOrder = this.sortOrder;
    } else if (column == 'datetime') {
      if (this.sortField != 'datetime') {
        this.sortField = 'datetime'; 
        this.sortOrder = 0;
      }
      this.sortOrder = (this.sortOrder + 1) % SearchComponent.NUM_OF_SORT_MODE;
      this.table.sortField = this.sortField;
      this.table.sortOrder = this.sortOrder;
    }
    this.table.filterDelay = 0;
    this.table._filter();
    this.table.filterDelay = this.FILTER_DELAY;
  }

  /**
   * Search invoices with keyword or query on specific input field.
   * @param input keyword or query to be search on server.
   * @param field search field global, invoice id, or store name.
   */
  searchInput(input: string, field: string):void {
    switch(field) {
      case "global":
        this.table.filterGlobal(input, null);
        break;
      default:
        this.table.filter(input, field, null);
    }
    this.searchChanged = true;
  }

  /**
   * Prompt delete confrimation and perform delete operation if accepted.
   * @param id the id of invoice to be deleted.
   * @param invoiceID invoice id to be displayed at confirmation model.
   */
  deleteInvoice(id: string, invoiceID: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this invoice ?',
      header: 'Invoice ' + invoiceID.toUpperCase(),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.invoiceService.deleteInvoice(id).pipe(take(1)).subscribe(() => {
          this.refresh();
          this.messageService.add({key:'searchMessage', severity:'warn', summary:'Deleted', detail:'Invoice has been deleted'});
        });
      },
      reject: () => {}
    });
  }

  /**
   * Set search result and total record to observe for event and make request to server.
   */
  private initSearch(): void {
    this.loading = true;
    this.searchResult = this.searchParams.pipe(
      switchMap((searchParams) => <Observable<Invoice[]>> this.searchService.searchInvoice(searchParams)),
      tap(() => {
        this.loading = false;
      })
    );
    this.totalRecords = this.searchParams.pipe(
      switchMap((searchParams) => <Observable<number>> this.searchService.totalSearchInvoice(searchParams))
    )
  }

  ngOnDestroy() {
    this.searchParams.unsubscribe();
  }
}
