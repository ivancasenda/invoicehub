import { Inject, Injectable } from '@angular/core';

import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { Printer } from 'src/app/models/printer.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private STORAGE_KEY:string = 'local_last_used_printer';

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) { }

  /**
   * Store printer to user's local storage.
   * @param printer 
   */
  public storeLastUsedPrinter(printer: Printer): void {
    this.storage.set(this.STORAGE_KEY, printer);
  }

  /**
   * Retrieve user's stored printer from local storage.
   */
  public getLastUsedPrinter(): Printer {
    return this.storage.get(this.STORAGE_KEY);
  }
}
