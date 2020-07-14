import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { SearchSymbolResult, SearchSymbolMatch, ApiNote, DailySession } from '../model/alphavan';
import { HistoricDay } from '../model/stock';

@Injectable({
    providedIn: 'root'
})
export class AlphavanService {
    
    private apiKey;
    
    constructor(private http: HttpClient) {
    }
    
    public setApiKey(apiKey: string) {
        this.apiKey = apiKey;
    }
    
    public searchSymbol (keyword: string) : Observable<SearchSymbolMatch[] | string> {
        
        return this.http.get<SearchSymbolResult | ApiNote>(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${this.apiKey}`).pipe(
        map(x => {
            if(x["bestMatches"] === undefined) {
                // license warning
                return (x as ApiNote).Note;
            }
            else {
                let ret = (x as SearchSymbolResult).bestMatches.filter((v,i,o) => v["3. type"] === "Equity");
                return ret;
            }
        }));
    }
    
    public getDailyAdjusted (symbol: string) : Observable<HistoricDay[] | string> {
        
        return this.http.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=${this.apiKey}`).pipe(
        map(x => {
            let dayHistory = x["Time Series (Daily)"] as object;
            if(dayHistory === undefined) {
                let errMessage = x["Error Message"] as string;
                if(errMessage !== undefined) {
                    // error
                    const errMsg = `api error when getting daily history for ${symbol}: ${errMessage}`;
                    console.info (errMsg);
                    return errMsg;
                }
                else {
                    let apiNote = x["Note"] as string
                    if(apiNote !== undefined) {
                        // license warning                        
                        const errMsg = (`api note when getting daily history for ${symbol}: ${apiNote}`);
                        console.info (errMsg);
                        return errMsg;
                    }
                    else {
                        const xstr = JSON.stringify(x);
                        const errMsg = (`unknown api error when getting daily history for ${symbol}: ${xstr}`);
                        console.info (errMsg);
                        return errMsg;
                    }
                }                    
            }                
            else {
                let dayEntries = Object.entries(dayHistory);
                let retHistoricDays = dayEntries.map(([dayStr, session]) => this.mapDayEntry(dayStr, session as DailySession))
                return retHistoricDays;
            }     
        })
        );
    }
    
    private mapDayEntry(dateStr: string, s: DailySession) :  HistoricDay {
        // date format is YYYY-MM-dd
        const yearStr = dateStr.substr(0,4);
        const monthStr = dateStr.substr(5, 2);
        const dayStr = dateStr.substr(8,2);
        
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        const day = parseInt(dayStr);
        
        // the month is zero indexed. Go figure.
        const date = new Date(year, month-1, day);
        
        const retHistDay: HistoricDay = {
            day: date,
            high: s["2. high"],
            low: s["3. low"],
            open: s["1. open"],
            close: s["4. close"],
            volume: s["5. volume"]
        };
        
        return retHistDay;
    }
    
}