import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

/**
 * Handle all http error.
 * Intercept http error and display message to user.
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private messageService: MessageService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        let errorSummary: string;
        let errorDetail: string;

        if (error.error instanceof ErrorEvent) {
          // client-side error

          errorSummary = "Client Error";
          errorDetail = `Error: ${error.error.message}`;
        } else {
          // server-side error

          if (error.status == 0) {
            errorSummary = "502 Koneksi Error";
            errorDetail = "Tidak dapat terhubung dengan server";
          } else {
            if (error.error != null) {
              errorSummary = `${error.status} ${error.error.summary == undefined ? error.error.error : error.error.summary}`;
              errorDetail = `Error: ${error.error.detail}`;
            } else {
              errorSummary = `${error.status}`;
              errorDetail = `Error: ${error.message}`;
            }
          }
        }
        this.messageService.clear('loadingMessage');
        //window.alert(errorMessage);
        if (error.status.toString().charAt(0) == "4") this.router.navigate(['/error'], { queryParams: { errorSummary: errorSummary, errorDetail: errorDetail } });
        else this.messageService.add({key: 'toastMessage', severity: 'error', summary: errorSummary, detail: errorDetail, sticky: true});

        return throwError(errorDetail);
      })
    )
  }
}
