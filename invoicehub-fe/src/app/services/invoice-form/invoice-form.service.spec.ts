import { TestBed } from '@angular/core/testing';

import { InvoiceFormService } from './invoice-form.service';

describe('InvoiceFormService', () => {
  let service: InvoiceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
