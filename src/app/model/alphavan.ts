import { Stock, PortfolioStock } from './stock';

export interface SearchSymbolResult {
    bestMatches: SearchSymbolMatch[];
}

export interface ApiNote {
    Note: string;
}

export interface SearchSymbolMatch {
    "1. symbol": string;
    "2. name": string;
    "3. type": string;
    "4. region": string;
    "5. marketOpen": string;
    "6. marketClose": string;
    "7. timezone": string;
    "8. currency": string;
    "9. matchScore": number;
}

export function createStockFromMatch (match: SearchSymbolMatch) : Stock {
    return {
        symbol: match["1. symbol"],
        name: match["2. name"],
        region: match["4. region"],
        currency: match["8. currency"]
    };
}

export interface DailySession {
    "1. open": number;
    "2. high": number;
    "3. low": number;
    "4. close": number;
    "6. volume": number;
}