import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { StorageMap } from '@ngx-pwa/local-storage';
import { StockBookEntry, PortfolioStock, HistoricDay, Stock } from '../model/stock';
import { StockInfoData, stockInfoDataFromPortfolioStock } from '../model/database';
import { testportfolio } from '../model/testdata';

@Injectable({
    providedIn: 'root'
  })
export class StorageService {

    private readonly key_alphavan: string = "stockbook-key-alphavan";
    // list of symbols in portfolio
    //private readonly key1_symbols: string = "stockbook-key-v1-symbols";
    //private getKeyStockInfo(symbol: string) { return `stockbook-key-v1-${symbol}-stockinfo`; }
    //private getKeyStockEntries(symbol: string) { return `stockbook-key-v1-${symbol}-entries`; }
    //private getKeyStockHistoricDay(symbol: string) { return `stockbook-key-v1-${symbol}-dayhistory`; }

    constructor(private storage: StorageMap) {
    }

    public getAlphaVantageKeyApi () : Observable<string> {
        let ret$ = this.storage.get(this.key_alphavan).pipe(
            map(x => (x === undefined) ? undefined : x as string)
            );
        
        return ret$;
    }

    public saveAlphaVantageKeyApi(apiKey: string) : Observable<unknown> {
        let ret$ = this.storage.set(this.key_alphavan, apiKey);

        return ret$;
    }

    // private undefinedOrEmptyArray<T> (x: any) : T[] {
    //     return (x === undefined) ? [] : x;
    // }

    // public getStockBook (): Observable<PortfolioStock[]> {
    //     //return of(testportfolio);
    //     let ret$ = this.storage.get(this.key1_symbols).pipe(
    //         map(x => this.undefinedOrEmptyArray<string>(x)),
    //         switchMap(stockSymbolList => {
    //             if(stockSymbolList.length === 0) {
    //                 return of<PortfolioStock[]>([]);
    //             }
    //             else {
    //                 // get stock infos
    //                 let stockInfos$ = forkJoin(stockSymbolList.map(v => this.storage.get(this.getKeyStockInfo(v)).pipe(map(x => x as StockInfoData))));
    //                 // get stock book entries
    //                 let stockEntries$ = forkJoin(stockSymbolList.map(v => this.storage.get(this.getKeyStockEntries(v)).pipe(map(x => this.undefinedOrEmptyArray<StockBookEntry>(x)))));
    //                 // get stock daily history
    //                 let stockDayHistory$ = forkJoin(stockSymbolList.map(v => this.storage.get(this.getKeyStockHistoricDay(v)).pipe(map(x => this.undefinedOrEmptyArray<HistoricDay>(x)))));
    //                 // get portfolio
    //                 let portfolio$ = forkJoin([stockInfos$, stockEntries$, stockDayHistory$]).pipe(
    //                     map(([infos, entries, dailies]) =>
    //                         stockSymbolList.map((symbol,i) => { 
    //                             let pstock: PortfolioStock = { 
    //                                 stock: { symbol: symbol, name: infos[i].name, region: infos[i].region, currency: infos[i].currency },
    //                                 entries: entries[i],
    //                                 dayHistory: dailies[i],
    //                                 dateRange: infos[i].dateRange };
                                
    //                             return pstock;
    //                         })
    //                     ));

    //                 return portfolio$;
    //                 }
    //             }
    //         ));       
            
    //     return ret$;
    // }

    // public saveStockInfo (pstock: PortfolioStock): Observable<undefined> {
    //     let ret$ = this.storage.get(this.key1_symbols).pipe(
    //         map(x => this.undefinedOrEmptyArray<string>(x)),
    //         switchMap(stockSymbolList => {
    //             let found = stockSymbolList.indexOf(pstock.stock.symbol) >= 0;
    //             let saveSymbol$: Observable<undefined>;
    //             if(!found) {
    //                 // must add to the symbol list
    //                 saveSymbol$ = this.storage.set(this.key1_symbols, [...stockSymbolList, pstock.stock.symbol]);
    //             }
    //             else {
    //                 saveSymbol$ = of(undefined);
    //             }
    //             let stockInfo = stockInfoDataFromPortfolioStock(pstock);
    //             let saveInfo$ = this.storage.set(this.getKeyStockInfo(pstock.stock.symbol), stockInfo);
    //             let saves$ = forkJoin([saveSymbol$, saveInfo$]).pipe(map(x => undefined));
    //             return saves$;
    //         })
    //     );

    //     return ret$;
    // }

    // public saveStockEntries (symbol: string, entries: StockBookEntry[]): Observable<undefined> {
    //     let ret$ = this.storage.set(this.getKeyStockEntries(symbol), entries);

    //     return ret$;
    // }

    // public saveDailyHistory (symbol: string, dailies: HistoricDay[]): Observable<undefined> {
    //     let ret$ = this.storage.set(this.getKeyStockHistoricDay(symbol), dailies);

    //     return ret$;
    // }

}