import { Injectable } from '@angular/core';

/**
 * Utility Service provide common function and constant used across component and services.
 */
@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  static readonly BACKEND_SERVER_URL = 'https://invoice-hub-be-4cyp4fqmda-as.a.run.app'

  static readonly MOBILE_SCREEN_SIZE: number = 641;

  
  /**
   * Remove a character from string at specified index.
   * @param string 
   * @param index
   * @returns string after character at specified index removed.
   */
  static removeAtIndex(string: string, index: number):string {
    return string.substring(0, index) + string.substring(index + 1);
  }

  /**
   * Parse formmated number string to number type.
   * @param formattedNumber indonesian locale formatted number string to be parse.
   * @returns parsed number.
   */
  static parseDecimal(formattedNumber: string): number {
    if (formattedNumber == null) return null;
    let num:string = formattedNumber.split('.').join(''); //remove '.' in number string
    num = num.replace(',', '.');
    return Number.parseFloat(num);
  }

  /**
   * Get number of digits in formmated number string.
   * @param formattedNumber indonesian locale formatted number string.
   * @returns number of digits.
   */
  static getDigitsLength(formattedNumber: string): number {
    let num:string = formattedNumber.split('.').join(''); //remove '.' in number string
    num = num.replace(',', '');
    return num.toString().length;
  }

  /**
   * Remove underscore in text string if exist.
   * @param text
   * @returns text copy with underscore removed.
   */
  static removeUnderscore(text: string): string {
    return text.replace(/_/g, '');
  }

  /**
   * Format number string to 
   * indonesian locale, 
   * add thousand seperator,
   * remove other character except number, comma, dot, dash
   * prevent more than 2 digits after comma ',',
   * prevent more than 1 comma,
   * negative sign only at index 0 / begining
   * prevent more than 1 leading zero.
   * @param unformattedNumber 
   * @returns formatted number string.
   */
  static formatNumberString(unformattedNumber:string):string {
    if (unformattedNumber == '') return '';
    unformattedNumber = unformattedNumber.replace(/[^0-9.,-]/g, '');

    let negativeSignIndex = unformattedNumber.indexOf('-');
    if (negativeSignIndex != -1 && negativeSignIndex != 0) {
      unformattedNumber = UtilsService.removeAtIndex(unformattedNumber, negativeSignIndex);
    }
    
    if (negativeSignIndex == 0 && unformattedNumber.length != 2 && unformattedNumber.substring(1,2) == "0" && !(/0,/.test(unformattedNumber.substring(1,3)))) unformattedNumber = UtilsService.removeAtIndex(unformattedNumber, 1);
    else if (unformattedNumber.substring(0,1) == "0" && unformattedNumber.length != 1 && !(/0,/.test(unformattedNumber.substring(0,2)))) unformattedNumber = UtilsService.removeAtIndex(unformattedNumber, 0);
    
    let negativeFound: number = 0;   
    unformattedNumber = unformattedNumber.replace(/-/g, function (match) {
      negativeFound++;
      return (negativeFound > 1) ? "" : match;
    });

    let commaFound: number = 0;   
    unformattedNumber = unformattedNumber.replace(/,/g, function (match) {
      commaFound++;
      return (commaFound > 1) ? "" : match;
    });

    let commaIndex = unformattedNumber.indexOf(',');
    if (commaIndex == 0) unformattedNumber = unformattedNumber.replace(',', '');
    if (commaIndex != -1 && (unformattedNumber.length - commaIndex) > 3) {
      unformattedNumber = unformattedNumber.substring(0, commaIndex + 3);
    }

    unformattedNumber = unformattedNumber.split('.').join(''); //remove '.' in number string

    return unformattedNumber.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  }

  constructor() { }
}
