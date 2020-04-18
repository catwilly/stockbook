import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState } from '../model/stock';
import { FormControl } from '@angular/forms';
import * as StockBookActions from '../store/actions';
import { AlphavanService } from '../services/AlphavanService';
import { Observable, throwError } from 'rxjs';
import { SearchSymbolMatch } from '../model/alphavan';
import { catchError, map } from 'rxjs/operators';

@Component({
    selector: 'app-dialog-add-stock',
    templateUrl: './dialog-add-stock.component.html',
    styleUrls: ['./dialog-add-stock.component.css']
})
export class DialogAddStockComponent implements OnInit {
    
    public myControl = new FormControl();
    public matches$: Observable<SearchSymbolMatch[]>;
    
    public licenseMsg: string = null;
    public licenseError: boolean = null;

    private lastMatches: SearchSymbolMatch[] = [];
    private selectedStock: SearchSymbolMatch = null;
    private skipSearchOnce: boolean = false;

    
    constructor(public dialogRef: MatDialogRef<DialogAddStockComponent>, private alphaService: AlphavanService) {
        
    }
    
    ngOnInit() {        
        this.myControl.valueChanges.subscribe((x: string | SearchSymbolMatch) => {
            if(typeof x === 'string') {
                // user typed something or slected an option
                if(x !== null && x.length > 0) {
                    if(this.skipSearchOnce) {
                        // user selected an option
                        this.skipSearchOnce = false;
                    }
                    else {
                        // user typed something
                        this.matches$ = this.alphaService.searchSymbol(x).pipe(
                            map(x => {
                                if(typeof x === 'string') {
                                    // api key license note
                                    this.licenseMsg = x as string;
                                    this.licenseError = true;
                                    return this.lastMatches;
                                }
                                else {
                                    // matches returned
                                    this.licenseMsg = null;
                                    this.licenseError = false;
                                    let matches = (x as SearchSymbolMatch[]);
                                    this.lastMatches = matches;
                                    return matches;
                                }
                            }),
                            catchError(err => {
                                console.error(err);
                                return throwError(err);
                        }));
                    }
                }
            }
            else if(typeof x === 'object') {
                // user selected an option
                this.selectedStock = x;
                this.myControl.setValue(this.getSymbolName(x));
                this.skipSearchOnce = true;
            }
        });
    }
    
    public getSymbolName(match: SearchSymbolMatch) {
        return `${match["1. symbol"]} - ${match["2. name"]}`;
    }

    public cantEnter(): boolean {
        let canEnter;
        if(this.selectedStock !== null && this.getSymbolName(this.selectedStock) === this.myControl.value) {
            canEnter = true;
        }
        else {
            canEnter = false;
        }
        return !canEnter;
    }
    
    public onNoClick() {
        this.dialogRef.close(null);
    }
    
    public onEnter() {
        this.dialogRef.close(this.selectedStock);
    }
    
}