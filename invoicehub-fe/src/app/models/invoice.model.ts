import { Item } from "./item.model";
export interface Invoice {
    id?:number;
    invoiceID?:string; // ^[a-zA-Z]{3}-[0-9_]{1,13}$
    datetime?:string;
    storeName?:string;
    invoiceNote?:string;
    items?:Item[];
}