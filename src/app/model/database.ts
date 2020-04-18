import { PortfolioStock } from './stock'

export interface StockInfoData {
    // Stock
    symbol: string;
    name: string;
    region: string;
    currency: string;
    // app settings
    dateRange: string; 
}

export function stockInfoDataFromPortfolioStock(pstock: PortfolioStock): StockInfoData {
    return {
        symbol: pstock.stock.symbol,
        name: pstock.stock.name,
        region: pstock.stock.region,
        currency: pstock.stock.currency,
        dateRange: pstock.dateRange
    };
}