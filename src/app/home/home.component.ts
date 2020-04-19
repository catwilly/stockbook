import { Component, OnInit } from '@angular/core';
import { Store, createSelector, select } from '@ngrx/store';
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
import { DialogLangselComponent } from '../dialog-langsel/dialog-langsel-component';
import { filter, map } from 'rxjs/operators';
import { Utils } from '../model/utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  //private selectGapiInitializing = (state: AppState) => state.gapiInitializing;
  //private selectGapiInitialized = (state: AppState) => state.gapiInitialized;  
  //public ga$ = createSelector(this.selectGapiInitializing, x => x);
  
  public gapiInitializing$: Observable<boolean> = this.store.pipe(select(x => x.app.gapiInitializing));
  public gapiInitialized$: Observable<boolean> = this.store.pipe(select(x => x.app.gapiInitialized));

  public gapiSigningIn$: Observable<boolean> = this.store.pipe(select(state => state.app.googleSigningIn));
  public gapiSignedIn$: Observable<boolean> = this.store.pipe(select(state => state.app.googleSignedIn));
  
  public gapMustSignIn$: Observable<boolean> = this.store.select(state => state.app.gapiInitialized === true && state.app.googleSignedIn === false);

  public portfolioLoading$: Observable<boolean> = this.store.pipe(select(state => state.app.portfolioLoading));
  public portfolioLoaded$: Observable<boolean> = this.store.pipe(select(state => state.app.portfolio !== null));
  
  public stocksEur$: Observable<PortfolioStock[]> = this.store.pipe(select(state => state.app.portfolio), map(x => x.filter(pstock => pstock.stock.currency === "EUR")));
  public stocksUsd$: Observable<PortfolioStock[]> = this.store.pipe(select(state => state.app.portfolio), map(x => x.filter(pstock => pstock.stock.currency === "USD")));

  public lang$: Observable<string> = this.store.pipe(select(state => state.app.lang));
  
  public mustEnterAlphaApiKey$: Observable<boolean> = this.store.pipe(select(state => state.app.alphaApiKey === "nokey"));
  public alphaApiKeyValid$: Observable<boolean> = this.store.pipe(select(state => state.app.alphaApiKey !== null && state.app.alphaApiKey !== "nokey"));
  
  public displayedColumns: string[] = ['symbol', 'inv', 'div', 'history'];
  
  constructor(private store: Store<{app: AppState}>, public translate: TranslateService, public dialog: MatDialog, private router: Router) {
  }
  
  ngOnInit(): void {    
  }

  public getCurrencySymbol(row: PortfolioStock):string {
    switch(row.stock.currency) {
      case "EUR": return "€";
      case "USD": return "$";
      default: return row.stock.currency;
    }
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
    const dialogRef = this.dialog.open(DialogLangselComponent, {      
      width: '95%'
    });
    
    dialogRef.afterClosed().subscribe(lang => {
      if(lang) {
        this.store.dispatch(StockBookActions.saveLang({lang: lang}));
      }
    });

  }

  public onTableClick(row: PortfolioStock) {
    this.router.navigate(['/stock', row.stock.symbol]);
  }
  
  public getTotalNumShares(pstock: PortfolioStock): number {
    let ret = pstock.entries.reduce((p,x) => p + x.numShares, 0);
    
    return ret;
  }
  
  public getInvested(pstock: PortfolioStock): number {
    let ret = pstock.entries.reduce((p,x) => p + (x.entryType === BookEntryType.Buy ? x.numShares * x.sharePrice + x.comission : 0), 0);      

    return ret;
  }

  public getTotalInvested(portfolio: PortfolioStock[]): number {
    let ret = portfolio.reduce((p,x) => p + this.getInvested(x), 0);

    return ret;
  }
  
  public getDividends(pstock: PortfolioStock): number {
    let ret = pstock.entries.reduce((p,x) => p + (x.entryType === BookEntryType.Dividend ? x.total : 0), 0);
    
    return ret;
  }

  public getTotalDividends(portfolio: PortfolioStock[]): number {
    let ret = portfolio.reduce((p,x) => p + this.getDividends(x), 0);

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
