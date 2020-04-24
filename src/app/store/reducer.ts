
import {Action, createReducer, on} from '@ngrx/store';
import { AppState, StockBookEntry, PortfolioStock, BookEntryType, emptyAppState, Stock } from '../model/stock';
import * as StockBookActions from './actions';
import { state } from '@angular/animations';
import { SearchSymbolMatch, createStockFromMatch } from '../model/alphavan';
import { getLocaleDateFormat } from '@angular/common';

const initialState: AppState = emptyAppState;

const reducer = createReducer(initialState, 
    // Portfolio loading
    on(StockBookActions.loadPortfolioFromDrive, (state, action) => {        
        return {...state, portfolioLoading: true};
    }),    
    // Portfolio loaded
    on(StockBookActions.portfolioLoaded, (state, action) => {       
        return {...state, portfolio: action.portfolio, portfolioLoading: false };
        }),
    // Lang loaded
    on(StockBookActions.langLoaded, (state, action) => {
        return {...state, lang: action.lang };
    }),
    on(StockBookActions.addPortfolioStock, (state, action) => {
        return {...state,
                portfolio: [...state.portfolio, action.stockMatch]
            };
    }),
    on(StockBookActions.stockDayHistoryLoaded, (state, action) => {
        let updatedPortfolio = state.portfolio.map((v,i,o) => {
            if(v.stock.symbol === action.stockSymbol) {
                return {...v, dayHistory: action.dayHistory, loadingHistory: false}
            }
            else {
                return v;
            }
        });

        return {...state, portfolio: updatedPortfolio };
    }),
    on(StockBookActions.updateDateRange, (state, action) => {
        let updatedPortfolio = state.portfolio.map((v,i,o) => {
            if(v.stock.symbol === action.symbol) {
                return {...v, dateRange: action.dateRange}
            }
            else {
                return v;
            }
        });

        return {...state, portfolio: updatedPortfolio };
    }),
    on(StockBookActions.addBookEntry, (state, action) => {
        let updatedPortfolio = state.portfolio.map((v,i,o) => {
            if(v.stock.symbol === action.symbol) {
                let newEntries = [...v.entries, action.entry];
                newEntries.sort((e1, e2) => e1.timeStamp < e2.timeStamp ? -1 : +1);
                return {...v, entries: newEntries}
            }
            else {
                return v;
            }
        });

        return {...state, portfolio: updatedPortfolio };
    }),
    // GAPI Initializing
    on(StockBookActions.gapiInitialize, (state, action) => {
        return {...state, gapiInitializing: true };
    }),    
    // GAPI Initialized
    on(StockBookActions.gapiInitialized, (state, action) => {
        return {...state, gapiInitialized: true, gapiInitializing: false, googleSignedIn: action.signedIn };
    }),
    // GAPI Signing in
    on(StockBookActions.gapiSignIn, (state, action) => {
        return {...state, googleSigningIn: true };
    }),
    // Google User Signed in
    on(StockBookActions.gapiSignedIn, (state, action) => {
        return {...state, googleSignedIn: true, googleSigningIn: false };        
    }),
    // AlphaVantage key
    on(StockBookActions.loadedAlphaApiKeyFromStorage, (state, action) => {
        return {...state, alphaApiKey: action.key};
    }),
    // Loading portfolio stock report
    on(StockBookActions.loadingPorfolioReport, (state, action) => {
        return {...state, loadingStockReport: action.report };
    }),
    // Request to load stock history
    on(StockBookActions.loadStockDayHistory, (state, action) => {
        let updatedPortfolio = state.portfolio.map((v,i,o) => {
            if(v.stock.symbol === action.stockSymbol) {
                return {...v, loadingHistory: true }
            }
            else {
                return v;
            }
        });

        return {...state, portfolio: updatedPortfolio };
    })
);

export function stockbookReducer(state: AppState | undefined, action: Action) {
    return reducer(state, action);
}


