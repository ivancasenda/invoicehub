import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule,  HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { SearchComponent } from './components/search/search.component';
import { ErrorComponent } from './components/error/error.component';

import { HttpErrorInterceptor } from './interceptors/http-error/http-error.interceptor';

import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { TableModule } from 'primeng/table';
import { InplaceModule } from 'primeng/inplace';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { LocalStorageService } from './services/local-storage/local-storage.service';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    InvoiceFormComponent,
    SearchComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,

    ReactiveFormsModule,
    HttpClientModule,

    ButtonModule,
    SplitButtonModule,
    CalendarModule,
    InputTextModule,
    InputNumberModule,
    InputMaskModule,
    TableModule,
    InplaceModule,
    RippleModule,
    ToastModule,
    MenubarModule,
    DialogModule,
    ConfirmDialogModule,
    TooltipModule,
    MessagesModule,
    MessageModule,
    CheckboxModule,
    InputSwitchModule,
    DropdownModule
  ],
  providers: [
    MessageService, 
    ConfirmationService, 
    Title, 
    LocalStorageService,  
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
