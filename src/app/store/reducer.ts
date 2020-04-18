
import {Action, createReducer, on} from '@ngrx/store';
import { AppState, StockBookEntry, PortfolioStock, BookEntryType, emptyAppState, Stock } from '../model/stock';
import * as StockBookActions from './actions';
import { state } from '@angular/animations';
import { SearchSymbolMatch, createStockFromMatch } from '../model/alphavan';
import { getLocaleDateFormat } from '@angular/common';

const initialState: AppState = emptyAppState;

const reducer = createReducer(initialState, 
    on(StockBookActions.portfolioLoaded, (state, action) => {       
        return {...state, 
                portfolio: action.portfolio };
        }),
    on(StockBookActions.langLoaded, (state, action) => {
        return {...state,
                lang: action.lang };
    }),
    on(StockBookActions.addPortfolioStock, (state, action) => {
        return {...state,
                portfolio: [...state.portfolio, action.stockMatch]
            };
    }),
    on(StockBookActions.stockDayHistoryLoaded, (state, action) => {
        let updatedPortfolio = state.portfolio.map((v,i,o) => {
            if(v.stock.symbol === action.stockSymbol) {
                return {...v, dayHistory: action.dayHistory}
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
    on(StockBookActions.gapiSignedIn, (state, action) => {
        return {...state, googleSignedIn: true };        
    }),
    on(StockBookActions.gapiInitialized, (state, action) => {
        return {...state, gapiInitialized: true, googleSignedIn: action.signedIn };
    }),
    on(StockBookActions.loadedAlphaApiKeyFromStorage, (state, action) => {
        return {...state, alphaApiKey: action.key, alphaApiKeyLoaded: true};
    })
);

export function stockbookReducer(state: AppState | undefined, action: Action) {
    return reducer(state, action);
}


