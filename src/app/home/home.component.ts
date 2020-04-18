import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { StockBookEntry, PortfolioStock, AppState, BookEntryType } from '../model/stock';
import { Observable } from 'rxjs';
import * as StockBookActions from '../store/actions';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddStockComponent } from '../dialog-add-stock/dialog-add-stock.component';
import { SearchSymbolMatch, createStockFromMatch } from '../model/alphavan';
import { Router } from '@angular/router';
import { DialogAddApiKeyComponent } from '../dialog-add-apikey/dialog-add-apikey.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  public initialized$: Observable<boolean> = this.store.select(state => state.app.lang !== null && state.app.portfolio !== null && state.app.alphaApiKey !== undefined);
  public stocks$: Observable<PortfolioStock[]> = this.store.select(state => state.app.portfolio);
  public lang$: Observable<string> = this.store.select(state => state.app.lang);
  
  public signIn$: Observable<boolean> = this.store.select(state => state.app.gapiInitialized === true && state.app.googleSignedIn === false);
  
  public mustEnterAlphaApiKey$: Observable<boolean> = this.store.select(state => state.app.alphaApiKeyLoaded === false && state.app.alphaApiKey === undefined);
  
  public displayedColumns: string[] = ['symbol', 'inv', 'div', 'history'];
  
  constructor(private store: Store<{app: AppState}>, public translate: TranslateService, public dialog: MatDialog, private router: Router) {
    
    
  }
  
  ngOnInit(): void {
  }

  public onEnterApiKey() {
    const dialogRef = this.dialog.open(DialogAddApiKeyComponent, {
      width: '95%'
    });
    
    dialogRef.afterClosed().subscribe((apiKey: string) => {
      if(apiKey) {
        this.store.dispatch(StockBookActions.saveAlphaApiKey({key: apiKey }));
      }
    });
  }
  
  public onSelectLang() {
    
  }
  public onTableClick(row: PortfolioStock) {
    this.router.navigate(['/stock', row.stock.symbol]);
  }
  
  public getTotalNumShares(pstock: PortfolioStock): number {
    let ret = pstock.entries.reduce((p,x) => p + x.numShares, 0);
    
    return ret;
  }
  
  public getTotalInvested(pstock: PortfolioStock): number {
    let ret = pstock.entries.reduce((p,x) => p + (x.entryType === BookEntryType.Buy ? x.numShares * x.sharePrice + x.comission : 0), 0);
    
    return ret;
  }
  
  public getTotalDividends(pstock: PortfolioStock): number {
    let ret = pstock.entries.reduce((p,x) => p + (x.entryType === BookEntryType.Dividend ? x.total : 0), 0);
    
    return ret;
  }
  
  public onAdd() {
    const dialogRef = this.dialog.open(DialogAddStockComponent, {      
      width: '95%',
      height: '90%'
    });
    
    dialogRef.afterClosed().subscribe((match: SearchSymbolMatch) => {
      if(match) {
        let stock = createStockFromMatch(match);
        // TODO: check if stock exists
        
        const portfolioStock: PortfolioStock = { 
          stock: stock, 
          entries: [ ],
          dayHistory: [ ],
          dateRange: "year1"
        };
        
        this.store.dispatch(StockBookActions.addPortfolioStock({stockMatch: portfolioStock}));
        this.store.dispatch(StockBookActions.saveStockInfo({symbol: stock.symbol}));
        this.store.dispatch( StockBookActions.loadStockDayHistory({stockSymbol: stock.symbol}));
      }
    });
  }
  
  public onGoogleSignIn() {
    this.store.dispatch(StockBookActions.gapiSignIn());
  }
  
  public onSaveAll() {
    this.store.dispatch(StockBookActions.saveAll());
  }
  
}
