import { Injectable, EventEmitter } from "@angular/core";
import { Observable, from, ReplaySubject  } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PortfolioStock, StockBookEntry, HistoricDay } from '../model/stock';
import { StockInfoData, stockInfoDataFromPortfolioStock } from '../model/database';
const CLIENT_ID = "1027072148146-frp6p2lq7k82fbl3ikn6u89g9ln6p6d3.apps.googleusercontent.com";
const API_KEY = "AIzaSyDEvdC_qB__9CsoODtmMHreDWS6TXM51ng";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive';

@Injectable()
export class GapiSession {
    googleAuth: gapi.auth2.GoogleAuth;
    appFolderId: string;
    
    private symbolsFileName = 'symbols.json';
    private getFileNameStockInfo(symbol: string) { return `${symbol}-stockinfo.json`; }
    private getFileNameStockEntries(symbol: string) { return `${symbol}-entries.json`; }
    private getFileNameStockHistoricDay(symbol: string) { return `${symbol}-dayhistory.json`; }

    constructor(private http: HttpClient) {
    }

    public initClient() : Observable<boolean> {
        let sub = new ReplaySubject<boolean>(1)

        gapi.load('client:auth2', () => {
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
            }).then(() => {                   
                this.googleAuth = gapi.auth2.getAuthInstance();
                let isSignedIn = this.googleAuth.isSignedIn.get();
                if(isSignedIn) {
                    this.onSingedIn().then(() => {
                        sub.next(isSignedIn);
                        sub.complete();
                    });
                }
                else {
                    sub.next(isSignedIn);
                    sub.complete();
                }                
            });
        });
       
        return sub.asObservable();
    }

    public get isSignedIn(): boolean {
        return this.googleAuth.isSignedIn.get();
    }

    public async signIn() : Promise<unknown> {
        // sign in
        await this.googleAuth.signIn();
                
        await this.onSingedIn();

        return;
    }

    private async onSingedIn() {
        console.log('google user singed in');

        // init app folder
        await this.getOrCreateAppFolder();

        console.log('app folder id = ' + this.appFolderId);
    }

    public async getStockBook (): Promise<PortfolioStock[]> {
        
        let retPortfolio: PortfolioStock[] = [];
        // get symbols
        let stockSymbolList = await this.tryReadFile<string[]>(this.symbolsFileName)

        if(stockSymbolList.length > 0) {
            for(let i=0; i<stockSymbolList.length; i++) {
                let sym = stockSymbolList[i];

                // get stock infos
                let stockInfo = await this.tryReadFile<StockInfoData>(this.getFileNameStockInfo(sym));
                
                // get stock entries
                let stockEntries = await this.tryReadFile<StockBookEntry[]>(this.getFileNameStockEntries(sym));                
                stockEntries = this.undefinedOrEmptyArray<StockBookEntry>(stockEntries);
                stockEntries = stockEntries.map(x => ({ ...x, timeStamp: new Date(x.timeStamp) }));

                // get stock dailies
                let stockDaily = await this.tryReadFile<HistoricDay[]>(this.getFileNameStockHistoricDay(sym));
                stockDaily = this.undefinedOrEmptyArray<HistoricDay>(stockDaily);
                stockDaily = stockDaily.map(x => ({ ...x, day: new Date(x.day) }));

                // create portfolio stock
                let pstock: PortfolioStock = {
                    stock:  { symbol: sym, name: stockInfo.name, region: stockInfo.region, currency: stockInfo.currency },
                    entries: stockEntries,
                    dayHistory: stockDaily,
                    dateRange: stockInfo.dateRange
                };
                
                retPortfolio.push(pstock);
            }            
        }

        return retPortfolio;
    }

    public async saveStockInfo (pstock: PortfolioStock): Promise<unknown> {        
        // get symbols
        let stockSymbolList = await this.tryReadFile<string[]>(this.symbolsFileName)

        // check if it is already stored
        let found = stockSymbolList.indexOf(pstock.stock.symbol) >= 0;
        if(!found) {
            // must add to the symbol list and save
            await this.saveFile(this.symbolsFileName, [...stockSymbolList, pstock.stock.symbol]);
        }

        // save stock info file
        let stockInfo = stockInfoDataFromPortfolioStock(pstock);
        await this.saveFile(this.getFileNameStockInfo(pstock.stock.symbol), stockInfo);

        return;
    }

    public async saveStockEntries (symbol: string, entries: StockBookEntry[]): Promise<unknown> {
        
        await this.saveFile(this.getFileNameStockEntries(symbol), entries);

        return;
    }

    public async saveDailyHistory (symbol: string, dailies: HistoricDay[]): Promise<unknown> {
        
        await this.saveFile(this.getFileNameStockHistoricDay(symbol), dailies);

        return;
    }

    private undefinedOrEmptyArray<T> (x: any) : T[] {
        return (x === undefined) ? [] : x;
    }    
    
    private async tryReadFile<T>(filename:string) : Promise<T> {
        
        let fileId = await this.tryGetFileId(filename);

        if(fileId === undefined) {
            return undefined;
        }
        else {        
            let accessToken = gapi.auth.getToken().access_token;
            let url = `https://www.googleapis.com/drive/v2/files/${fileId}?alt=media`;
            let headers = new HttpHeaders({'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken});
            let retObj = await this.http.get<T>(url, { headers }).toPromise()

            return retObj;
        }
    }

    private async getOrCreateAppFolder() : Promise<unknown> {
        let appFolder = await this.tryGetFolderId('stockbook');
        if(appFolder === undefined) {
            console.log('app folder did not exist');
            // create app folder
            this.appFolderId = await this.createFolder('stockbook');
            console.log('app folder created');
            //Create file symbols.json
            await this.saveFile(this.symbolsFileName, []);
            console.log('empty symbols file created');
        }
        else {
            console.log('app folder already exists');
            this.appFolderId = appFolder;
            // check if symbols.json exists
            console.log('looking for symbols file');
            let symbolsFileId = await this.tryGetFileId(this.symbolsFileName);
            if(symbolsFileId === undefined) {
                console.log('creating empty symbols file');
                symbolsFileId = await this.saveFile(this.symbolsFileName, []);
                console.log('empty symbols file created. id = ' + symbolsFileId);
            }
            else {
                console.log('symbols file already exists. id = ' + symbolsFileId);
            }
        }
        
        return;
    }

    private async saveFile(filename: string, value: any): Promise<string> {
        
        // check if file already exists
        let fileId = await this.tryGetFileId(filename);
        if(fileId === undefined) {
            // create
            let createRes = await gapi.client.drive.files.create({            
                resource: {
                    name: filename,
                    parents: [this.appFolderId],
                  },
                  fields: 'id'
            });
    
            fileId = createRes.result.id;
        }
        
        let accessToken = gapi.auth.getToken().access_token;
        let url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
        let headers = new HttpHeaders({'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken});
        await this.http.patch(url, value, { headers }).toPromise()
        
        return fileId;
    }

    private async createFolder(folderName: string): Promise<string> {
        
        let fileId = await gapi.client.drive.files.create({
            resource: {
                'name': folderName,
                'mimeType': 'application/vnd.google-apps.folder'
              },
              fields: 'id',
        });
        
        return fileId.result.id;
    }

    private async tryGetFolderId(folderName: string) : Promise<string> {
        let fileId = await gapi.client.drive.files.list(
            {
                corpora: 'user',
                q: `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}'`
            });
        
        if(fileId.result.files.length === 0) {
            return undefined;
        }
        else {
            return fileId.result.files[0].id;
        }
    }

    private async tryGetFileId(fileName: string) : Promise<string> {
        let fileId = await gapi.client.drive.files.list(
            {
                corpora: 'user',
                q: `'${this.appFolderId}' in parents and name = '${fileName}'`,                
            });
        
        if(fileId.result.files.length === 0) {
            return undefined;
        }
        else {
            return fileId.result.files[0].id;
        }
    }

    signOut(): void {
        this.googleAuth.signOut();
    }
}