import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Headers, Http, Response, URLSearchParams } from '@angular/http'
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import * as _ from 'underscore';

import { StockDatum } from './model/stock-datum';
import { StockOptionDatum } from './model/stock-option-datum';
import { Spread } from './model/spread';
import { Condor } from './model/condor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
  ]
})

export class AppComponent implements OnInit {

  status: string = '';
  data = null;
  error = null;
  showFilter: boolean = false;

  session_id: string = null;
  login_date: string = null;

  // Filters
  symbolInput: string;
  minDelta: number = 0.05;
  maxDelta: number = 0.15;
  minDaysExp: number = 30;
  maxDaysExp: number = 120;
  minSpreadCredit: number = 0.20;
  maxSpreadMargin: number = 1000;
  minCondorCredit: number = 0.40;
  minCondorRoc: number = 8;
  maxSpreads: number = 5;
  maxCondors: number = 15;

  startTime: number = 0;
  stockIdx: number = 0;
  stockDatums: { [symbol: string]: StockDatum } = {};
  stockOptionDatums: { [symbol: string]: StockOptionDatum[] } = {};

  callSpreads: { [symbol: string]: Spread[] } = {};
  putSpreads: { [symbol: string]: Spread[] } = {};
  condors: { [symbol: string]: Condor[] } = {};

  filteredCallSpreads: { [symbol: string]: Spread[] } = {};
  filteredPutSpreads: { [symbol: string]: Spread[] } = {};
  filteredCondors: { [symbol: string]: Condor[] } = {};

  searchParams: {
    symbols?: string,
    historic?: boolean,
    delete_existing?: boolean
  } = {};

  symbols: string[] = [
    'AAPL',
    'AMGN',
    'AMZN',
    'APC',
    'BA',
    'BABA',
    'BIDU',
    'CAT',
    'CELG',
    'CMG',
    'COST',
    'CVX',
    'DE',
    'DIA',
    'EEM',
    'EFA',
    'EOG',
    'FB',
    'FDX',
    'FXE',
    'GILD',
    'GLD',
    // 'GMCR',
    'GOOGL',
    'GS',
    'HD',
    'IBM',
    'IWM',
    'IYR',
    // 'KMP',
    'LMT',
    // 'LNKD',
    'MON',
    //'NDX',
    'NFLX',
    // 'OEX',
    'OXY',
    'PCLN',
    'QQQ',
    // 'RUT',
    'SBUX',
    'SLB',
    // 'SNDK',
    // 'SPX',
    'SPY',
    'TIF',
    'TLT',
    'TSLA',
    'V',
    'VMW',
    'WYNN',
    'XLE',
    'XLU',
    'XOM',
    // 'XOP',
    'XRT',
    'ZMH',
  ];

  activeSymbol: string = null;

  rows = [
    {
      "name": "Ethel Price",
      "gender": "female",
      "company": "Johnson, Johnson and Partners, LLC CMP DDC",
      "age": '22'
    },
    {
      "name": "Claudine Neal",
      "gender": "male",
      "company": "Sealoud",
      "age": '55'
    },
    {
      "name": "Beryl Rice",
      "gender": "female",
      "company": "Velity",
      "age": '67'
    },
  ];

  constructor(private http: Http) {
  }

  public ngOnInit():void {
    // this.searchSymbols();
  }

  public getStockDatums(): StockDatum[] {
    return this.stockDatums ? _.values(this.stockDatums) : [];
  }

  public getStockDatum(symbol: string): StockDatum {
    return this.stockDatums[symbol];
  }

  public getStockOptionDatums(): StockOptionDatum[] {
    let datums: StockOptionDatum[] = [];
    if(this.stockOptionDatums) {
      _.values(this.stockOptionDatums).forEach((item: StockOptionDatum[]) => {
        datums = datums.concat(item);
      })
    }
    return datums;
  }

  private getNextSymbol() {
    if(this.stockIdx < this.getSymbols().length) {
      this.getLatestStockData(this.getSymbols()[this.stockIdx]);
      this.stockIdx++;
    } else {
      this.stockIdx = 0;
      this.activeSymbol = this.getSymbols()[0];
      this.calculateCreditSpreads();
      this.calculateCondors();
      this.status = 'Loading data complete (' + (((new Date).getTime() - this.startTime) / 1000) + ' sec)';
    }
  }

  private getSessionParams(): URLSearchParams {
    let params: URLSearchParams = new URLSearchParams();
    this.session_id && params.set('session_id', this.session_id);
    this.login_date && params.set('login_date', this.login_date);
    return params;
  }

  private getStockData(symbol: string, params: URLSearchParams, loadAdditional: boolean = true) {
    this.status = 'Loading ' + symbol + ' stock data...';
    this.http.get('http://localhost:3000/stocks.json', { search: params })
      .map((res: Response) => res.json())
      .subscribe(
        (res) => {
          if(res.meta) {
            this.session_id = res.meta.session_id;
            this.login_date = res.meta.login_date;
          }

          res.data.stocks && res.data.stocks.forEach(datum => {
            let datumObj: StockDatum = new StockDatum();
            datumObj.accept(datum);
            this.stockDatums[datumObj.symbol] = datumObj;
          });

          if(loadAdditional) {
            this.getStockOptionData(symbol, loadAdditional);
          } else {
            this.getNextSymbol();
          }
        },
        (error) => {
          console.log('*** error:', error);
          this.error = error
        });
  }

  private getLatestStockData(symbol: string) {
    if(!symbol) {
      console.error('getLatestStockData - symbol null');
      return;
    }

    let params: URLSearchParams = this.getSessionParams();
    params.set('latest', 'true');
    params.set('symbols', symbol);
    this.getStockData(symbol, params, true);
  }

  // private getHistoryStockData() {
  //   let params: URLSearchParams = this.getSessionParams();
  //   this.searchParams.symbols && params.set('symbols', this.searchParams.symbols);
  //   this.searchParams.historic && params.set('historic', this.searchParams.historic + "");
  //   this.searchParams.delete_existing && params.set('delete_existing', this.searchParams.delete_existing + "");
  //   this.getStockData(null, params);
  // }

  private getStockOptionData(symbol: string, loadAdditional: boolean = true) {
    this.status = 'Loading ' + symbol + ' stock option data...';
    let params: URLSearchParams = this.getSessionParams();
    params.set('symbols', symbol);
    params.set('minDaysExp', this.minDaysExp + '');
    params.set('maxDaysExp', this.maxDaysExp + '');

    this.http.get('http://localhost:3000/stock_options.json', { search: params })
      .map((res: Response) => res.json())
      .subscribe(
        (res) => {
          if(res.meta) {
            this.session_id = res.meta.session_id;
            this.login_date = res.meta.login_date;
          }

          res.data.stock_options && res.data.stock_options.forEach(datum => {
            let datumObj: StockOptionDatum = new StockOptionDatum();
            datumObj.accept(datum);
            datumObj.underlying = this.stockDatums[datumObj.symbol];

            if(this.filterOption(datumObj)) {
              this.addOption(datumObj);
            }
          });

          if(loadAdditional) {
            this.loadVolatility(symbol);
          } else {
            this.getNextSymbol();
          }
        },
        (error) => {
          console.log('*** error:', error);
          this.error = error
        });
  }

  private addOption(option: StockOptionDatum) {
    let datums: StockOptionDatum[] = this.stockOptionDatums[option.symbol];
    if (!datums) {
      datums = [];
      this.stockOptionDatums[option.symbol] = datums;
    }
    datums.push(option);
  }

  private filterOption(option: StockOptionDatum) {
    if(option.daysToExpiration < this.minDaysExp)
      return false;
    else if(option.daysToExpiration > this.maxDaysExp)
      return false;
    return true;
  }

  // public search() {
  //   this.getHistoryStockData();
  // }

  public loadVolatility(symbol: string) {
    let params: URLSearchParams = new URLSearchParams();
    this.session_id && params.set('session_id', this.session_id);
    this.login_date && params.set('login_date', this.login_date);
    params.set('symbols', symbol);

    this.status = 'Loading ' + symbol + ' volatility data...'
    this.http.get('http://localhost:3000/volatilities.json', { search: params })
      .map((res: Response) => res.json())
      .subscribe(
        (res) => {
          console.log('*** response:', res);

          if(res.meta) {
            this.session_id = res.meta.session_id;
            this.login_date = res.meta.login_date;
          }

          if(res.data.volatility && res.data.volatility.length) {
            let stock: StockDatum = this.stockDatums[symbol];
            if(stock) {
              stock.setIV(res.data.volatility[0]);
            };
          }

          this.status = 'Volatility loading complete.'
          this.getNextSymbol();
        },
        (error) => {
          console.log('*** error:', error);
          this.error = error
        });
  }


  private calculateCreditSpreads() {
    this.status = 'Calculation credit spreads...';

    this.callSpreads = {};
    this.putSpreads = {};

    this.getSymbols().forEach((symbol: string) => {
      let options: StockOptionDatum[] = this.stockOptionDatums[symbol];

      // Start with the highest strikes
      options = _.sortBy(options, (option: StockOptionDatum) => option.strike).reverse();

      for (let i: number = 0; i < options.length; i++) {
        for (let j: number = 0; j < options.length; j++) {
          let o1: StockOptionDatum = options[i];
          let o2: StockOptionDatum = options[j];

          if (o1.call != o2.call ||
            (o1.strike - o2.strike) <= 0 ||
            o1.daysToExpiration != o2.daysToExpiration) {
            continue;
          }

          // Build the spread
          let spread: Spread = new Spread();
          if (o1.call) {
            spread.shortOption = o2;
            spread.longOption = o1;
          }
          else {
            spread.shortOption = o1;
            spread.longOption = o2;
          }

          let strikeSpread: number = o1.strike - o2.strike;
          let spreadPrice: number = o1.last - o2.last;
          if(o1.call)
            spreadPrice = o2.last - o1.last;

          spread.strikeWidth = strikeSpread;
          spread.margin = strikeSpread * 100;
          spread.credit = spreadPrice;
          spread.calculateValues();

          if(!(spread.credit > 0)) {
            continue;
          }

          this.addSpread(spread);
        }
      }
    });

    this.filterSpreads();

    // console.log('*** call spread: ', this.filteredCallSpreads);
    // console.log('*** put spread: ', this.filteredPutSpreads);
    // spreads.forEach((spread: Spread) => {
    //   console.log('*** spread: ', spread);
    // });
  }

  private filterSpreads() {
    this.filteredCallSpreads = {};
    this.filteredPutSpreads = {};

    this.status = 'Filtering spreads...'
    this.getSymbols().forEach((symbol: string) => {
      let spreads: Spread[] = this.callSpreads[symbol];
      this.filteredCallSpreads[symbol] = [];
      spreads && spreads.forEach((spread: Spread) => {
        this.filterSpread(spread) && this.filteredCallSpreads[symbol].push(spread);
      });

      spreads = this.putSpreads[symbol];
      this.filteredPutSpreads[symbol] = [];
      spreads && spreads.forEach((spread: Spread) => {
        this.filterSpread(spread) && this.filteredPutSpreads[symbol].push(spread);
      });
    });
  }

  private filterSpread(spread: Spread): boolean {
    if(Math.abs(spread.shortOption.delta) > this.maxDelta) {
      return false;
    }

    if(Math.abs(spread.shortOption.delta) < this.minDelta) {
      return false;
    }

    if(spread.credit < this.minSpreadCredit) {
      return false;
    }

    if(spread.margin > this.maxSpreadMargin) {
      return false;
    }

    return true;
  }

  private addSpread(spread: Spread) {
    let spreadMap = spread.shortOption.call ? this.callSpreads : this.putSpreads;
    let spreads: Spread[] = spreadMap[spread.shortOption.symbol];
    if (!spreads) {
      spreads = [];
      spreadMap[spread.shortOption.symbol] = spreads;
    }
    spreads.push(spread);
  }

  private calculateCondors() {
    this.status = 'Calculation condors...';

    this.condors = {};

    this.getSymbols().forEach((symbol: string) => {

      let symbolPutSpreads: Spread[] = this.filteredPutSpreads[symbol];
      let symbolCallSpreads: Spread[] = this.filteredCallSpreads[symbol];

      for (let i: number = 0; i < symbolPutSpreads.length; i++) {
        for (let j: number = 0; j < symbolCallSpreads.length; j++) {

          let putSpread: Spread = symbolPutSpreads[i];
          let callSpread: Spread = symbolCallSpreads[j];

          // Only compare spreads of the same margin and expiration
          if(putSpread.margin != callSpread.margin)
            continue;
          if(putSpread.shortOption.daysToExpiration != callSpread.shortOption.daysToExpiration)
            continue;

          let condor: Condor = new Condor(putSpread, callSpread);

          // Only output three condors per margin amount
          // Integer cnt = (Integer) condorCntMap.get(new Float(putSpread.margin));
          // if(cnt == null)
          //   condorCntMap.put(new Float(putSpread.margin), new Integer(1));
          // else {
          //   if(cnt.intValue() > 3)
          //     continue;
          //   else
          //     condorCntMap.put(new Float(putSpread.margin), new Integer(cnt.intValue() + 1));
          // }

          this.addCondor(condor);
        }
      }
    });

    this.filterCondors();

    // console.log('*** condor count: ' + _.values(this.condors).length);
    // _.values(this.condors).forEach((condors: Condor[]) => {
    //   condors.forEach((condor: Condor) => console.log('*** condor: ', condor));
    // });

  }

  private filterCondors() {
    this.filteredCondors = {};

    this.status = 'Filtering condors...'
    this.getSymbols().forEach((symbol: string) => {
      let condors: Condor[] = this.condors[symbol];
      this.filteredCondors[symbol] = [];
      condors && condors.forEach((condor: Condor) => {
        this.filterCondor(condor) && this.filteredCondors[symbol].push(condor);
      });
    });
  }

  private filterCondor(condor: Condor): boolean {
    if(condor.credit < this.minCondorCredit) {
      return false;
    }

    if(condor.roc < this.minCondorRoc) {
      return false;
    }

    return true;
  }

  private addCondor(condor: Condor) {
    let symbol: string = condor.putSpread.shortOption.symbol;
    let condors: Condor[] = this.condors[symbol];
    if (!condors) {
      condors = [];
      this.condors[symbol] = condors;
    }
    condors.push(condor);
  }

// //Stock stock = optionMap.get(o1.symbol);
// //if(stock != null && spread.IV <= 0)
// //	spread.IV = stock.IV;
//
// //System.out.println(spread.getCombinedSpreadCSV());
//
// // Filter
// //if(spread.commission > maxCommission) {
// //	outputFilterMsg(spread.getMinimalSpreadCSV(), "commission", Float.toString(spread.commission));
// //	continue;
// //}
// if(spread.roc < minROC) {
//   outputFilterMsg(spread.getMinimalSpreadCSV(), "ROC", Float.toString(spread.roc));
//   continue;
// }
// if(spread.margin > maxMargin) {
//   outputFilterMsg(spread.getMinimalSpreadCSV(), "max margin", Float.toString(spread.margin));
//   continue;
// }
// if(spread.margin < minMargin) {
//   outputFilterMsg(spread.getMinimalSpreadCSV(), "min margin", Float.toString(spread.margin));
//   continue;
// }
// //if(spread.shortOption.percentFromMarket < minPercentFromMarket) {
// //	outputFilterMsg(spread.getMinimalSpreadCSV(), "percentFromMarket", Float.toString(spread.shortOption.percentFromMarket));
// //	continue;
// //}
// if(minCreditPercentOfStrikeWidth > 0) {
//   float tmpCredit = strikeSpread * minCreditPercentOfStrikeWidth;
//   if(spread.credit < tmpCredit) {
//     outputFilterMsg(spread.getMinimalSpreadCSV(), "minCreditPercentOfStrikeWidth", Float.toString(spread.credit) + " [" + tmpCredit + "]");
//     continue;
//   }
// }
// else {
//   if(spread.credit < minCredit) {
//     outputFilterMsg(spread.getMinimalSpreadCSV(), "credit", Float.toString(spread.credit));
//     continue;
//   }
// }
// /* if(spread.shortOption.underlying.IVPercent < minIVPercent) {
//  outputFilterMsg(spread.getMinimalSpreadCSV(), "minIVPercent", Float.toString(spread.shortOption.underlying.IVPercent));
//  continue;
//  }
//  if(spread.shortOption.underlying.IVPercent > maxIVPercent) {
//  outputFilterMsg(spread.getMinimalSpreadCSV(), "maxIVPercent", Float.toString(spread.shortOption.underlying.IVPercent));
//  continue;
//  } */
//
// retvals.add(spread);
// }
// }
// }
//
// return retvals;
// }

  private selectTab(symbol: string){
    this.activeSymbol = symbol;
  }

  private filterChanged() {
    let start: number = (new Date()).getTime();
    this.calculateCreditSpreads();
    this.calculateCondors();
    this.status = "Completed filtering (" + (((new Date()).getTime() - start)/1000) + " secs)";
  }

  private showFilterClicked() {
    this.showFilter = !this.showFilter;
  }

  private getSymbols(): string[] {
    if(this.symbolInput && this.symbolInput.length) {
      return this.symbolInput.split(',').map(s => s.trim()).map(s => s.toUpperCase());
    }

    return this.symbols;
  }

  private getTabSymbols(): string[] {
    return _.sortBy(this.getSymbols(), (item: string) => (this.stockDatums[item] && this.stockDatums[item].ivr) || 0).reverse();
  }

  private searchSymbols() {
    this.startTime = (new Date).getTime();
    this.stockIdx = 0;
    this.stockDatums = {};
    this.stockOptionDatums = {};
    this.callSpreads = {};
    this.putSpreads = {};
    this.condors = {};

    this.getNextSymbol();
  }

}
