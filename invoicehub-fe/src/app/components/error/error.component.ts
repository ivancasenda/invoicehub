import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

/** Component for error page /error */
@Component({
  selector: 'app-not-found',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit, OnDestroy {

  private paramSubscription: Subscription;

  errorSummary: string = "404 Tidak Ditemukan";
  errorDetail: string = "Error: Halaman tidak dapat ditemukan";

  constructor(private route: ActivatedRoute) { }

  /**
   * Initialize and display to page error summary and detail from url request parameter.
   */
  ngOnInit(): void {
    this.paramSubscription = this.route.queryParams
      .subscribe(params => {
        let paramSummary:string = params.errorSummary;
        let paramDetail:string = params.errorDetail;
        if (paramSummary != undefined && paramDetail != undefined) {
          this.errorSummary = paramSummary;
          this.errorDetail = paramDetail;
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.paramSubscription.unsubscribe();
  }

}
