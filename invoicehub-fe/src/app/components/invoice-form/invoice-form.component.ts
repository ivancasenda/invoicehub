import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Input, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormArray, FormControl } from '@angular/forms'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

import { Invoice } from '../../models/invoice.model';
import { InvoiceService } from '../../services/invoice/invoice.service'
import { InvoiceFormService } from '../../services/invoice-form/invoice-form.service'
import { UtilsService } from '../../services/utils/utils.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { tableRowAnimation } from '../../animations/table-row.animation';

import { registerLocaleData } from '@angular/common';
import locales from '@angular/common/locales/id';

/**
 * Component for invoice form page / or /invoice/id/{id}
 */
@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css'],
  animations: [tableRowAnimation.animate],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceFormComponent implements OnInit, OnDestroy {
  static readonly WINDOW_TITLE: string = "Invoice - New";
  static readonly INPUT_MAX_LENGTH: number = 15;
  static readonly DEFAULT_MOBILE_LIST_SIZE: number = 3;
  static readonly DEFAULT_DESKTOP_LIST_SIZE: number = 5;
  
  private num_default_item = InvoiceFormComponent.DEFAULT_DESKTOP_LIST_SIZE;
  private subscriptions: { [key: string]: Subscription } = {};

  isMobile: boolean = false;
  
  idParam: string = null;
  dateInterval: any;
  outOfRangeError: boolean;
  withTitle: FormControl = new FormControl(false);
  items: MenuItem[];
  
  invoiceForm: FormGroup;
  itemsForm: FormArray;
  totalPrice: number = 0;
  totalAmount: number[] = [];
  

  constructor(
    private invoiceService: InvoiceService, 
    private invoiceFormService: InvoiceFormService,
    private changeDetector: ChangeDetectorRef, 
    private router: Router, 
    private route: ActivatedRoute,
    private messageService: MessageService, 
    private confirmationService: ConfirmationService,
    private titleService: Title) { }

  /**
   * Set locale and listen to changes in url parameter and reload (click same link).
   */
  ngOnInit(): void {
    registerLocaleData(locales, 'id');
    if (window.screen.width <= UtilsService.MOBILE_SCREEN_SIZE) { // Moblie Config
      this.isMobile = true;
      this.num_default_item = InvoiceFormComponent.DEFAULT_MOBILE_LIST_SIZE;
    }

    this.subscriptions['routeParamMap'] = this.route.paramMap.subscribe(params => {
      this.idParam = params.get('id');
      this.initInvoiceForm(this.idParam);
    });

    this.subscriptions['reload'] = this.router.events.subscribe((e: any) => {
      // Initialize new Invoice Form when click "New"
      if (e instanceof NavigationEnd) {
        this.totalAmount = [];
        this.totalPrice = 0;
        this.initInvoiceForm(this.idParam);
      }
    });
  }

  /**
   * Update datetime field to current datetime on invoice reactive form.
   */
  updateCurrentDatetime(): void {
    this.invoiceForm.get('datetime').patchValue(new Date());
  }

  /**
   * Add additional row / item form to invoice form.
   */
  addRow(): void {
    this.itemsForm.push(this.invoiceFormService.getBlankItemForm());
  }

  /**
   * Remove row / item in invoice form.
   * @param rowIndex row / item index to be deleted.
   */
  deleteRow(rowIndex:number, event): void {
    if(event == 0) return; //prevent enter key trigger
    this.itemsForm.removeAt(rowIndex);
    this.totalAmount.splice(rowIndex, 1);
    this.calculateTotalPrice();
  }

  /**
   * Stop datetime update on invoice form datetime field.
   */
  disableDateInterval() {
    clearInterval(this.dateInterval);
  }
  
  /**
   * Update and format quantity or price input field to correct format by adding thousand seperator, remove invalid input and set cursor position.
   * @param rowIndex 
   * @param quantity current inputed quantity.
   * @param price current inputed price.
   * @param mode specify input field that just been changed quantity or price.
   * @param inputElement price or quantity element object to get cursor position
   */
  formatInputAndUpdateTotal(rowIndex: number, quantity: string, price: string, mode: string, inputElement): void {
    let cursorPosition: number;

    if (mode == "price") {
      cursorPosition = price.length - inputElement.selectionEnd;
      
      price = UtilsService.formatNumberString(price);
      this.itemsForm.get([rowIndex, 'price']).setValue(price);
      
      cursorPosition = price.length - cursorPosition;
    } else {
      cursorPosition = quantity.length - inputElement.selectionEnd;
      
      quantity = UtilsService.formatNumberString(quantity);
      this.itemsForm.get([rowIndex, 'quantity']).setValue(quantity);
      
      cursorPosition = quantity.length - cursorPosition;
    }

    if (cursorPosition < 0) cursorPosition = 0;
    inputElement.selectionStart = cursorPosition;
    inputElement.selectionEnd = cursorPosition;
    
    this.totalAmount[rowIndex] = this.calculateTotalAmount(quantity, price);
    this.calculateTotalPrice();
  }

  /**
   * Check if number is NaN.
   * @param number number to be check.
   * @returns boolean wheter number is NaN.
   */
  isNaN(number: number): boolean {
    return Number.isNaN(number);
  }

  /**
   * Make request to save and print current invoice data to sever, display message, and reload page.
   */
  saveAndPrint(): void {
    let invoice: Invoice = this.invoiceFormService.convertInvoiceFormToInvoice(this.invoiceForm);

    this.invoiceService.saveInvoice(invoice).pipe(take(1)).subscribe((savedInvoice) => {
      this.router.navigate(['invoice/id/' + savedInvoice.id]).then(() => {
        this.messageService.add({key:'toastMessage', severity:'success', summary:'Saved', detail:'Invoice has been saved'});
      });
    });

    this.messageService.add({key:'loadingMessage', severity:'info', summary:'Loading', detail:'Processing', sticky: true});
    this.invoiceService.printInvoice(invoice).pipe(take(1)).subscribe((file: any) => {
      this.messageService.clear('loadingMessage');
      this.messageService.add({ key: 'toastMessage', severity: 'success', summary: 'PDF', detail: 'PDF Downloaded' });
      file = new Blob([file], { type: "application/pdf" });
      this.downloadFile(file, this.invoiceForm.get('invoiceID').value + ".pdf");
    });
  }

  /**
   * Make request to update and print invoice data to server and display message.
   */
  updateAndPrint(): void {
    let invoice: Invoice = this.invoiceFormService.convertInvoiceFormToInvoice(this.invoiceForm);

    this.invoiceService.updateInvoice(invoice).pipe(take(1)).subscribe(() => {
      this.messageService.add({key:'toastMessage', severity:'success', summary:'Updated', detail:'Invoice updated'});
    });

    this.messageService.add({key:'loadingMessage', severity:'info', summary:'Loading', detail:'Processing', sticky: true});
    this.invoiceService.printInvoice(invoice).pipe(take(1)).subscribe((file: any) => {
      this.messageService.clear('loadingMessage');
      this.messageService.add({ key: 'toastMessage', severity: 'success', summary: 'Invoice', detail: 'PDF Downloaded' });
      file = new Blob([file], { type: "application/pdf" });
      this.downloadFile(file, this.invoiceForm.get('invoiceID').value + ".pdf");
    });
  }

  /**
   * Make request to save invoice data and display message.
   */
  saveInvoice():void {
    this.invoiceService.saveInvoice(this.invoiceFormService.convertInvoiceFormToInvoice(this.invoiceForm)).pipe(take(1)).subscribe((savedInvoice) => {
      this.router.navigate(['invoice/id/' + savedInvoice.id]).then(() => {
        this.messageService.add({key:'toastMessage', severity:'success', summary:'Saved', detail:'Invoice has been saved'});
      });
    });
  }

  /**
   * Make request to update invoice data and display message.
   */
  updateInvoice():void {
    this.invoiceService.updateInvoice(this.invoiceFormService.convertInvoiceFormToInvoice(this.invoiceForm)).pipe(take(1)).subscribe(() => {
      this.messageService.add({key:'toastMessage', severity:'success', summary:'Updated', detail:'Invoice has been updated'});
    });
  }

  private downloadFile(file: Blob, file_name: string): void {
    let downloadURL = window.URL.createObjectURL(file);
    let link = document.createElement('a');
    link.href = downloadURL;
    link.download = file_name;
    link.click();
  }

  /**
   * Make request to update invoice data and display message.
   */
  printInvoice(): void {
    this.messageService.add({key:'loadingMessage', severity:'info', summary:'Loading', detail:'Processing', sticky: true});
    this.invoiceService.printInvoice(this.invoiceFormService.convertInvoiceFormToInvoice(this.invoiceForm)).pipe(take(1)).subscribe((file: any) => {
      this.messageService.clear('loadingMessage');
      this.messageService.add({ key: 'toastMessage', severity: 'success', summary: 'PDF', detail: 'PDF Downloaded' });
      file = new Blob([file], { type: "application/pdf" });
      this.downloadFile(file, this.invoiceForm.get('invoiceID').value + ".pdf");
    });
  }

  /**
   * Display delete confirmation, make delete request and display message if accepted.
   */
  deleteInvoice(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this invoice ?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.invoiceService.deleteInvoice(this.invoiceForm.get('id').value).pipe(take(1)).subscribe();
        this.router.navigate(['/']).then(() => {
          this.messageService.add({key:'toastMessage', severity:'warn', summary:'Deleted', detail:'Invoice deleted'});
        });
      },
      reject: () => {}
    });
  }

  /**
   * Create and fill invoice form based on id, create blank form if invoice with id not found.
   * @param id id of invoice to be displayed.
   */
  private initInvoiceForm(id: string): void {
    this.invoiceFormService.getInvoiceForm(id).pipe(take(1)).subscribe((invoiceForm:FormGroup) => {
      this.invoiceForm = invoiceForm;
      this.itemsForm = this.invoiceForm.get('items') as FormArray;

      this.subscriptions['asyncValidMarkCheck'] = this.invoiceForm.get('invoiceID').statusChanges.subscribe(() => this.changeDetector.markForCheck());
      this.changeDetector.markForCheck();

      if (id == null) {
        this.subscriptions['newInvoiceID'] = this.invoiceService.generateInvoiceID().subscribe(result => {
          this.invoiceForm.get('invoiceID').setValue(result.newInvoiceID);
        });

        for ( let i = 0; i < this.num_default_item; i++){
          this.addRow();
        }
        this.dateInterval = setInterval(() => {
          this.invoiceForm.get('datetime').patchValue(new Date());
        }, 1000);

        this.titleService.setTitle(InvoiceFormComponent.WINDOW_TITLE);
      }else {
        let storeName:string = this.invoiceForm.get('storeName').value;
        this.titleService.setTitle((storeName == null ? "Invoice" : storeName));
        
        let totalItem = this.itemsForm.value.length
        for ( let i = 0; i < totalItem; i++) {
          let quantity:string = this.itemsForm.get([i, 'quantity']).value;
          let price:string = this.itemsForm.get([i, 'price']).value;
          if (quantity == null || price == null)continue;
          this.totalAmount[i] = this.calculateTotalAmount(quantity, price);
        }

        this.calculateTotalPrice();
      }
    });

    this.initMenuItem();
  }

  /**
   * Set and initialize the control button item drop down
   */
  private initMenuItem() {
    let saveOrUpdateLabel: string = "Save";
    if(this.idParam != null)  saveOrUpdateLabel = "Update";

    this.items = [
      {label: saveOrUpdateLabel, icon: 'pi pi-save', command: () => {
          if(this.idParam == null) this.saveInvoice();
          else this.updateInvoice();
      }},
      {separator: true},
      {label: 'Print', icon: 'pi pi-print', command: () => {
          this.printInvoice();
      }},
    ];
  }

  /**
   * Multiply quantity and price to get total amount and round to 2 decimal places.
   * @param quantity 
   * @param price 
   * @returns zero if quantity or price is empty 
   * else multiplied and rounded number of quantity and price.
   */
  private calculateTotalAmount(quantity: string, price: string): number {
    if (quantity == '' || quantity == '-' || price == '' || price == '-') {
      return 0;
    }

    let priceLength = UtilsService.getDigitsLength(price);
    let quantityLength = UtilsService.getDigitsLength(quantity);

    if ((priceLength + quantityLength) > InvoiceFormComponent.INPUT_MAX_LENGTH){
      return null;
    }

    let priceNumber: number = UtilsService.parseDecimal(price);
    let quantityNumber: number = UtilsService.parseDecimal(quantity);

    let amount:number = Math.round((((quantityNumber * 100) * (priceNumber * 100)) + Number.EPSILON) / 100) / 100;
    return amount;
  }

  /**
   * Calculate and update total price field.
   * Check, disabled and display message if total price or amount is out of range.
   */
  private calculateTotalPrice(): void {
    let outOfRange:boolean = false;
    
    this.totalPrice = 0;
    this.totalAmount.forEach(amount => {
      this.totalPrice += (amount * 100);
    });
    this.totalPrice = this.totalPrice / 100;
    
    if (UtilsService.getDigitsLength(this.totalPrice.toString()) > InvoiceFormComponent.INPUT_MAX_LENGTH) {
      outOfRange = true;
      this.totalPrice = 0;
    }
    if (outOfRange == false) {
      this.totalAmount.forEach((price:number) => {
        if (price == null){
          outOfRange = true;
        }     
      });
    }
    if (outOfRange && this.outOfRangeError == false) {
      this.messageService.add({key:'outOfRangeErrorMessage', severity:'error', summary:'Total out of range', detail:'number to long'});
    } else if (!outOfRange) {
      this.messageService.clear('outOfRangeErrorMessage');
    }

    this.outOfRangeError = outOfRange;
  }

  /**
   * Listen for changes in window screen size and update isMobile property.
   * @param event 
   */
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    if(window.innerWidth <= UtilsService.MOBILE_SCREEN_SIZE) this.isMobile = true;
    else this.isMobile = false;
  }

  /**
   * Unsubscribe all subscription and clear date time update interval.
   */
  ngOnDestroy(): void {
    Object.values(this.subscriptions).forEach((element:Subscription) => {
      element.unsubscribe();
    });
    clearInterval(this.dateInterval);
  }
}
