
export interface Stock {
    symbol: string;
    name: string;
    region: string;
    currency: string;
}

export interface HistoricDay {
    day: Date;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
}

export enum BookEntryType {
    Buy = 0,
    Sell = 1,
    Dividend = 2
}

export interface StockBookEntry {
    timeStamp: Date;
    entryType: BookEntryType;
    sharePrice: number;
    numShares: number;
    comission: number;
    taxes: number;
    total: number;
}

export interface PortfolioStock {
    stock: Stock;
    entries: StockBookEntry[];
    dayHistory: HistoricDay[];
    dateRange: string; 
}

// this is the main state
export interface AppState {
    portfolio: PortfolioStock[];
    lang: string;
    gapiInitializing: boolean,
    gapiInitialized: boolean,
    googleSigningIn: boolean;
    googleSignedIn: boolean;
    portfolioLoading: boolean;
    alphaApiKey: string;
}

export const emptyAppState: AppState = {
    portfolio: null,
    lang: null,
    gapiInitializing: false,
    gapiInitialized: false,
    googleSigningIn: false,
    googleSignedIn: false,
    portfolioLoading: false,
    alphaApiKey: null,
}


