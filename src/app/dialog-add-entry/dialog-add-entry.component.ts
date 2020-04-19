import { OnInit, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StockBookEntry, BookEntryType } from '../model/stock';

export interface DialogAddEntryData {
    currency: string;    
  }

@Component({
    selector: 'app-dialog-add-entry',
    templateUrl: './dialog-add-entry.component.html',
    styleUrls: ['./dialog-add-entry.component.css']
})
export class DialogAddEntryComponent implements OnInit {
    
    public entryType: string = "buy";
    public timestamp: Date = new Date();
    
    public numShares: number = null;
    public sharePrice: number = null;
    public comission: number = null;
    public taxes: number = null;
    public total: number = null;

    public currency: string;
    
    constructor(public dialogRef: MatDialogRef<DialogAddEntryComponent>, @Inject(MAT_DIALOG_DATA) private data: DialogAddEntryData) {
        this.currency = data.currency;
    }
    
    ngOnInit() { 
    }
    
    public onNoClick() {
        this.dialogRef.close(null);
    }
    
    private convertEntryType(val: string): BookEntryType {
        if(val === 'buy') {
            return BookEntryType.Buy;
        }
        else if(val === 'sell') {
            return BookEntryType.Sell;
        }
        else if (val === 'div') {
            return BookEntryType.Dividend;
        }
        else {
            console.error('unexpected type value ' + val);
            return null;
        }
    }
    
    public onEnter() {
        const entryType = this.convertEntryType(this.entryType);
        if(entryType != null) {
            
            const entry: StockBookEntry = {
                timeStamp: this.timestamp,
                entryType: entryType,
                numShares: (entryType === BookEntryType.Buy || entryType === BookEntryType.Sell) ? this.numShares : null,
                sharePrice: (entryType === BookEntryType.Buy || entryType === BookEntryType.Sell) ? this.sharePrice : null,
                comission: (entryType === BookEntryType.Buy || entryType === BookEntryType.Sell) ? this.comission : 0,
                taxes: (entryType === BookEntryType.Dividend) ? this.taxes : 0,
                total: (entryType === BookEntryType.Dividend) ? this.total : null
            };
            
            this.dialogRef.close(entry);
        }
    }
    
    public cantEnter() {
        const entryType = this.convertEntryType(this.entryType);
        
        let canEnter;
        
        if(entryType === BookEntryType.Buy || entryType === BookEntryType.Sell) {
            canEnter = this.numShares != null && this.numShares >= 0 && this.sharePrice != null && this.sharePrice >= 0;
        }
        else {
            canEnter = this.total != null && this.total >= 0;
        }
        
        return !canEnter;
    }
}