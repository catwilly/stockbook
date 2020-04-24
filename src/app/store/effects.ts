
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, EMPTY, forkJoin, from, Subject } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap, withLatestFrom, tap } from 'rxjs/operators';
import { StorageService } from '../services/StorageService';
import { Stock, PortfolioStock, BookEntryType, StockBookEntry, AppState, HistoricDay, LoadingStockReport } from '../model/stock';
import * as StockBookActions from './actions';
import { LangService } from '../services/LangService';
import { TranslateService } from '@ngx-translate/core';
import { Store, Action } from '@ngrx/store';
import { AlphavanService } from '../services/AlphavanService';
import { GapiSession } from '../services/gapi.session';

@Injectable()
export class StockBookEffects {
        
    // Load Portfolio from Google Drive
    loadStockbook$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.loadPortfolioFromDrive),
        mergeMap(() => {
            let loadingSub: Subject<LoadingStockReport[]> = new Subject<LoadingStockReport[]>();
            loadingSub.asObservable().subscribe(n => this.store$.dispatch(StockBookActions.loadingPorfolioReport({report: n})));
            return from(this.gapiSession.getStockBook(loadingSub))        
            .pipe(
                mergeMap(portfolio => {
                    let loadHistoryActions = portfolio.filter((v,i,o) => v.dayHistory.length === 0)
                        .map((v,i,o) => StockBookActions.loadStockDayHistory({stockSymbol: v.stock.symbol}));
                
                    let retActions = [ StockBookActions.portfolioLoaded({ portfolio: portfolio }), ...loadHistoryActions ];
                
                    return retActions;
                }), 
                catchError(err => {
                    console.log(err);
                    return of(StockBookActions.storageFailed(err));
                }));
            })
    ));

    loadLang$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.loadLangFromStorage),
        mergeMap(() => this.langService.getLang()
        .pipe(
            map(lang => {
                let usedLang = (lang === undefined) ? this.getBrowserLang() : lang;
                // apply language setting
                this.translate.use(usedLang);
                return StockBookActions.langLoaded({lang: usedLang});
            }),
            catchError(err => {
                console.log(err);
                return of(StockBookActions.storageFailed(err));
            }))
        )
    ));    

    saveStockInfo$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.saveStockInfo),
        withLatestFrom(this.store$),
        mergeMap(([action,state]) => from(this.gapiSession.saveStockInfo(this.getPortfolioStock(action.symbol, state.app)))
        .pipe(
            map(() => StockBookActions.savedStockInfo()),
            catchError(err => {
                console.log(err);
                return of(StockBookActions.storageFailed(err));
            }))
            )
        )
    );

    saveStockEntries$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.saveStockEntries),
        withLatestFrom(this.store$),
        mergeMap(([action,state]) => from(this.gapiSession.saveStockEntries(action.symbol, this.getPortfolioStock(action.symbol, state.app).entries))
        .pipe(
            map(() => StockBookActions.savedStockEntries()),
            catchError(err => {
                console.log(err);
                return of(StockBookActions.storageFailed(err));
            }))
            )
        )
    );

    saveStockDaily$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.saveStockDaily),
        withLatestFrom(this.store$),
        mergeMap(([action,state]) => from(this.gapiSession.saveDailyHistory(action.symbol, this.getPortfolioStock(action.symbol, state.app).dayHistory))
        .pipe(
            map(() => StockBookActions.savedStockDaily()),
            catchError(err => {
                console.log(err);
                return of(StockBookActions.storageFailed(err));
            }))
            )
        )
    );

    saveAll$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.saveAll),
        withLatestFrom(this.store$),
        mergeMap(([action,state]) => {
            
            let infos$ = from(state.app.portfolio.map(x => this.gapiSession.saveStockInfo(x)));
            let entries$ = from(state.app.portfolio.map(x => this.gapiSession.saveStockEntries(x.stock.symbol, x.entries)));
            let dayHist$ = from(state.app.portfolio.map(x => this.gapiSession.saveDailyHistory(x.stock.symbol, x.dayHistory)));
            let all$ = forkJoin([infos$, entries$, dayHist$]).pipe(
                    map(() => StockBookActions.savedAll()),
                    catchError(err => {
                        console.log(err);
                        return of(StockBookActions.storageFailed(err));
                    }));

            return all$;
        }))
        );    

    saveLang$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.saveLang),
        tap(action => this.translate.use(action.lang)),
        mergeMap(action => this.langService.saveLang(action.lang)
        .pipe(
            map(() => StockBookActions.savedLang()),
            catchError(err => {
                console.log(err);
                return of(StockBookActions.storageFailed(err));
            }))
            )
        )
    );

    loadDayHistory$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.loadStockDayHistory),
        mergeMap(action => this.alphaService.getDailyAdjusted(action.stockSymbol).pipe(
            mergeMap(alphaRes => {
                if(typeof alphaRes === 'string') {
                    // api key license note
                    return from([StockBookActions.alphaVantageApiLicense({msg: alphaRes as string})]);
                }
                else {
                    // data returned
                    return from([StockBookActions.stockDayHistoryLoaded({stockSymbol: action.stockSymbol, dayHistory: alphaRes as HistoricDay[] }),
                                 StockBookActions.saveStockDaily({symbol: action.stockSymbol})]);
                }
            }),
            catchError(err => {
                console.log(err);
                return of(StockBookActions.alphaVantageConnectionFail());
            })
        ))));

    // Initialize GAPI
    // If signed in -> Load Portfolio
    gapiInitialize$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.gapiInitialize),
        mergeMap(action => this.gapiSession.initClient().pipe(
            mergeMap(signedIn => {
                if(signedIn) {
                    return from([StockBookActions.gapiInitialized({signedIn: signedIn}),
                                 StockBookActions.loadPortfolioFromDrive() ]);
                }
                else {                                
                    return of(StockBookActions.gapiInitialized({signedIn: signedIn}));
                }
            })
        )))
    );

    // GAPI sign in
    // When signed in -> Load Portfolio
    gapiSignIn$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.gapiSignIn),
            mergeMap(() => from(this.gapiSession.signIn()).pipe(
                mergeMap(user => from([StockBookActions.gapiSignedIn(),
                                       StockBookActions.loadPortfolioFromDrive() ])
        )))
    ));

    // Load AlphaVantage key from storage
    loadAlpha$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.loadAlphaApiKeyFromStorage),
        mergeMap(action => this.storageService.getAlphaVantageKeyApi().pipe(
            map(key => { 
                if(key !== undefined) {
                    this.alphaService.setApiKey(key);
                    return StockBookActions.loadedAlphaApiKeyFromStorage({key: key});
                }
                else {
                    return StockBookActions.loadedAlphaApiKeyFromStorage({key: "nokey"});
                }
        })))
    ))

    // Save AlphaVantage key to storage
    saveAlpha$ = createEffect(() => this.actions$.pipe(
        ofType(StockBookActions.saveAlphaApiKey),
        tap(action => this.alphaService.setApiKey(action.key)),
        mergeMap(action => this.storageService.saveAlphaVantageKeyApi(action.key).pipe(
            map(() => StockBookActions.savedAlphaApiKeyToStorage({key: action.key}))
        ))
    ))

    getBrowserLang() : string {
        let navLang = navigator.language;
        let retLang = navLang.substr(0,2);
        return retLang;
    }

    private getPortfolioStock(symbol: string, state: AppState) : PortfolioStock {
        let retPstock = state.portfolio.find(x => x.stock.symbol === symbol);

        return retPstock;
    }

    constructor(
        private actions$: Actions,
        private store$: Store<{app: AppState}>,
        private storageService: StorageService,
        private langService: LangService,
        private translate: TranslateService,
        private alphaService: AlphavanService,
        private gapiSession: GapiSession

        ) {
    }

        

    

}