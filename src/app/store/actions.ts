import {createAction, props, union} from '@ngrx/store';
import { StockBookEntry, Stock, PortfolioStock, HistoricDay } from '../model/stock';
import { SearchSymbolMatch } from '../model/alphavan';


export const loadPortfolioFromStorage = createAction('[Main] Load portfolio from storage');
export const portfolioLoaded = createAction('[Storage] Loaded portoflio success', props<{portfolio: PortfolioStock[]}>());
export const langLoaded = createAction('[Storage] Loaded lang success', props<{ lang: string }>());

export const loadLangFromStorage = createAction('[Main] Load lang from storage');

export const saveLang = createAction('[Porfolio Page] Save lang', props<{lang: string}>());
export const savedLang = createAction('[Storage] Lang saved');

export const loadAlphaApiKeyFromStorage = createAction('[Main] Load Alphavantage API key from storage');
export const loadedAlphaApiKeyFromStorage = createAction('[Storage] Loaded Alphavantage API key', props<{key: string}>());
export const saveAlphaApiKey = createAction('[Main Page] Save Alphavantage API key', props<{key: string}>());

export const saveStockInfo = createAction('[Porfolio Page] Save stock info', props<{symbol: string}>());
export const savedStockInfo = createAction('[Storage] Stock info saved');

export const saveStockEntries = createAction('[Porfolio Page] Save stock entries', props<{symbol: string}>());
export const savedStockEntries = createAction('[Storage] Stock entries saved');

export const saveStockDaily = createAction('[Porfolio Page] Save stock daily', props<{symbol: string}>());
export const savedStockDaily = createAction('[Storage] Stock daily saved');

export const saveAll = createAction('[Porfolio Page] Save all');
export const savedAll = createAction('[Storage] All saved');

export const storageFailed = createAction('[Storage] failed', props<{ errMsg: string }>());

//export const searchStock = createAction('[New Stock Page] Search stock', props<{keyword: string}>());
export const addPortfolioStock = createAction('[Porfolio Page] Add new stock', props<{stockMatch: PortfolioStock}>());
export const updateDateRange = createAction('[Stock Page] Update date range', props<{symbol: string, dateRange: string}>());

export const addBookEntry = createAction('[Stock Page] Add new book entry', props<{symbol: string, entry: StockBookEntry}>());

export const loadStockDayHistory = createAction('[Porfolio Page] Load stock day history', props<{stockSymbol: string}>());
export const stockDayHistoryLoaded = createAction('[AlphaVantage] stock day history loaded', props<{stockSymbol: string, dayHistory: HistoricDay[]}>());

export const alphaVantageApiLicense = createAction('[AlphaVantage] Error API license', props<{msg: string}>());
export const alphaVantageConnectionFail = createAction('[AlphaVantage] Error connection');

export const gapiInitialize = createAction('[Main] Google initialize');
export const gapiInitialized = createAction('[Google] Google initialized', props<{signedIn: boolean}>());

export const gapiSignIn = createAction('[Main] Google Sign in');
export const gapiSignedIn = createAction('[Google Drive] Google Signed in');
