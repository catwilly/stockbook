import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { AppState, PortfolioStock, HistoricDay, StockBookEntry, BookEntryType } from '../model/stock';
import { Observable, EMPTY } from 'rxjs';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
import { state } from '@angular/animations';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import * as StockBookActions from '../store/actions';
import { DialogAddEntryComponent } from '../dialog-add-entry/dialog-add-entry.component';
import { MatDialog } from '@angular/material/dialog';
import * as pluginAnnotations from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {

  public stock$: Observable<PortfolioStock> = this.route.paramMap.pipe(
    switchMap((params: ParamMap) => {
      let symbol = params.get('symbol');
      return this.store.pipe(select(state => state.app.portfolio?.find(v => v.stock.symbol === symbol)));
    }));;

  public chartData$: Observable<ChartDataSets[]> = this.stock$.pipe(
    map(x => {      
      let inx = this.findIndexRange(x.dayHistory, x.dateRange);
      return [ { data: x.dayHistory.slice(0,inx).map(h => h.close).reverse(), label: x.stock.symbol } ];
    })
  );  

  public chartLabels$: Observable<Label[]> = this.stock$.pipe(
    map(x => {
      let inx = this.findIndexRange(x.dayHistory, x.dateRange);
      return x.dayHistory.slice(0,inx).map(h => this.dateToString(h.day)).reverse();
    })
  );

  public chartType = 'line';
  public chartPlugins = [pluginAnnotations];
  public displayedColumns: string[] = ['time', 'type', 'sprice', 'shares', 'total'];

  public chartOptions$: Observable<(ChartOptions & { annotation: any })> = 
    this.stock$.pipe(
      map(stock => {
        return {
          responsive: true,
          scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            xAxes: [{}],
            yAxes: [
              {
                id: 'y-axis-0',
                position: 'left',
              }
            ]
          },
          annotation: {
            annotations: stock.entries.filter(x => x.entryType === BookEntryType.Buy || x.entryType === BookEntryType.Sell).map(entry =>
              ({
                type: 'line',
                mode: 'vertical',
                scaleID: 'x-axis-0',
                value: this.dateToString(entry.timeStamp),
                borderColor: entry.entryType === BookEntryType.Buy ? 'orange' : 'purple',
                borderWidth: 2,
                label: {
                  enabled: true,
                  fontColor: 'orange',
                  content: `${entry.numShares}@${entry.sharePrice}`
                }
              })),
          },
        };
      })
    );  

  constructor(private route: ActivatedRoute, public dialog: MatDialog, private router: Router, private store: Store<{app: AppState}>) { }

  ngOnInit(): void {
    
  }
  
  private numberTo2digits(x: number): string {
    const formattedNumber = ('0' + x).slice(-2);

    return formattedNumber;
  }

  public dateToString(date: Date): string {
    let str: string = '';
    if (date != null) {
      const month = date.getMonth() + 1;
      str = `${this.numberTo2digits(date.getDate())}/${this.numberTo2digits(month)}/${date.getFullYear()}`;
    }
    return str;
  }

  public entryTypeToString(entryType: BookEntryType): string {
    switch (entryType) {
      case BookEntryType.Buy: return 'Buy';
      case BookEntryType.Sell: return 'Sell';
      case BookEntryType.Dividend: return 'Dividend';
      default: return '';
    }
  }

  public getComissionOrTaxes(entry: StockBookEntry): number {
    switch (entry.entryType)
    {
      case BookEntryType.Buy:
      case BookEntryType.Sell: return -entry.comission;
      case BookEntryType.Dividend: return -entry.taxes;
      default: return -1;
    }
  }

  public getTotal(entry: StockBookEntry): number {
    switch (entry.entryType)
    {
      case BookEntryType.Buy:
      case BookEntryType.Sell: return entry.numShares * entry.sharePrice + entry.comission + entry.taxes;
      case BookEntryType.Dividend: return entry.total - entry.taxes;
      default: return -1;
    }
  }

  public getTotalColor(entry: StockBookEntry): string {
    switch (entry.entryType)
    {
      case BookEntryType.Buy:
      case BookEntryType.Sell: return 'white';
      case BookEntryType.Dividend: return 'lightgreen';
      default: 'white';
    }
  }

  public onDateRangeChange(e: MatButtonToggleChange, symbol: string) {
    let val = e.value as string;
    this.store.dispatch(StockBookActions.updateDateRange({symbol: symbol, dateRange: val}));
    this.store.dispatch(StockBookActions.saveStockInfo({symbol: symbol}));
  }

  public onAddEntry(pstock: PortfolioStock) {
    const dialogRef = this.dialog.open(DialogAddEntryComponent, {      
      width: '95%',
      height: '90%',
      data: { currency: pstock.stock.currency }
    });
    
    dialogRef.afterClosed().subscribe((entry: StockBookEntry) => {
      if(entry) {
        this.store.dispatch(StockBookActions.addBookEntry({symbol: pstock.stock.symbol, entry: entry}));
        this.store.dispatch(StockBookActions.saveStockEntries({symbol: pstock.stock.symbol}));
      }
      });
  }

  public onSync(pstock: PortfolioStock) {
    this.store.dispatch(StockBookActions.loadStockDayHistory({stockSymbol: pstock.stock.symbol}));
  }

  private findIndexRange(history: HistoricDay[], dateRange: string): number {
    let retInx: number;
    if(dateRange === "year1") {
      retInx = this.findIndexLastYear(history, 1);
    }
    else if(dateRange === "year2") {
      retInx = this.findIndexLastYear(history, 2);
    }
    else if(dateRange === "year3") {
      retInx = this.findIndexLastYear(history, 3);
    }
    else if(dateRange === "year4") {
      retInx = this.findIndexLastYear(history, 4);
    }
    else if(dateRange === "year5") {
      retInx = this.findIndexLastYear(history, 5);
    }
    else if(dateRange === "month1") {
      retInx = this.findIndexLastMonth(history, 1);
    }
    else if(dateRange === "month3") {
      retInx = this.findIndexLastMonth(history, 3);
    }
    else if(dateRange === "month6") {
      retInx = this.findIndexLastMonth(history, 6);
    }
    else {
      retInx = history.length-1;
    }

    return retInx;
  }

  private findIndexLastMonth(history: HistoricDay[], monthsBack: number): number {
    let lastDay = history[0].day;
    let monthsAgo = new Date(lastDay.getTime());
    monthsAgo.setMonth(monthsAgo.getMonth() - monthsBack);
    
    let retIndex = this.findIndexLastDate(history, monthsAgo);

    return retIndex;
  }

  private findIndexLastYear(history: HistoricDay[], yearsBack: number): number {
    let lastDay = history[0].day;
    let yearsAgo = new Date(lastDay.getTime());
    yearsAgo.setFullYear(lastDay.getFullYear() - yearsBack);
    
    let retIndex = this.findIndexLastDate(history, yearsAgo);

    return retIndex;
  }

  private findIndexLastDate(history: HistoricDay[], lastDate: Date): number {
    let retIndex = 0;
    for(let i=0; i<history.length; i++) {
      const day = history[i].day;
      if(day < lastDate) {
        return retIndex;
      }
      else
      {
        retIndex = i;
      }
    }
  }

  public onHome(pstock: PortfolioStock) {
    //this.store.dispatch(StockBookActions.saveStockEntries({symbol: pstock.stock.symbol}));
    this.router.navigate(['/'], { replaceUrl: true });
  }

}
