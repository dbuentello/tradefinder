import {Injectable, Output, EventEmitter} from "@angular/core";
import { Headers, Http, Response, URLSearchParams } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {Subscription} from "rxjs";
import * as _ from 'underscore';

import { StockDatum } from '../model/stock-datum';
import { StockOptionDatum } from '../model/stock-option-datum';
import { Spread } from '../model/spread';
import { Condor } from '../model/condor';
import {OptionPosition} from "../model/option-position";
import {TradeFilter} from "../tradefinder/trade-filter";

export interface OptionPositionMap {
  [symbol: string]: OptionPosition[];
}

export interface FetchOptions {
  searchSymbols: string[];
  symbolIdx: number;
  loadAdditional: boolean;
  applyFilter: boolean;
}

@Injectable()
export class OptionDataService {

  @Output()
  status: Subject<string> = new Subject();

  session_id: string = null;
  login_date: string = null;

  loading: boolean = false;
  stockLoadingMap: { [symbol: string]: boolean } = {};
  stockOptionLoadingMap: { [symbol: string]: boolean } = {};
  volatilityLoadingMap: { [symbol: string]: boolean } = {};
  startTime: number = 0;

  // searchSymbols: string[] = [];
  // stockIdx: number = 0;

  filter: TradeFilter = new TradeFilter();
  completeCb: Function = null;

  stockDatums: { [symbol: string]: StockDatum } = {};
  stockOptionDatums: { [symbol: string]: StockOptionDatum[] } = {};
  callSpreads: { [symbol: string]: Spread[] } = {};
  putSpreads: { [symbol: string]: Spread[] } = {};
  condors: { [symbol: string]: Condor[] } = {};

  filteredCallSpreads: { [symbol: string]: Spread[] } = {};
  filteredPutSpreads: { [symbol: string]: Spread[] } = {};
  filteredCondors: { [symbol: string]: Condor[] } = {};

  positions: OptionPositionMap = {};

  symbols: string[] = [
    'AA',
    // 'AAL',
    'AAP',
    'AAPL',
    'ABBV',
    'ABT',
    // 'ABX',
    'AET',
    // 'AGN',
    'AIG',
    // 'AKS',
    'ALLY',
    // 'AMD',
    'AMGN',
    'AMTD',
    // 'AMX',
    'AMZN',
    'APA',
    'APC',
    // 'ARNC',
    'ATVI',
    // 'AVP',
    'AXP',
    'AZN',
    'B',
    'BA',
    'BABA',
    'BAC',
    'BMY',
    'BP',
    'BX',
    'C',
    'CAT',
    'CELG',
    // 'CHK',
    'CL',
    // 'CLF',
    'CMCSA',
    'CMG',
    'COP',
    'COST',
    // 'CPN',
    'CRM',
    'CRUS',
    'CSCO',
    'CSX',
    'CTSH',
    'CVS',
    // 'CY',
    'DAL',
    'DB',
    'DIA',
    'DIS',
    'DOW',
    'EA',
    'EBAY',
    'EEM',
    'EFA',
    'EL',
    'EPD',
    // 'ETE',
    'ETFC',
    'ETP',
    'EWT',
    'EWW',
    'EWY',
    // 'F',
    'FB',
    // 'FCX',
    'FDX',
    // 'FEYE',
    // 'FIT',
    'FXE',
    'FIX',
    'G',
    'GDX',
    'GDXJ',
    'GE',
    // 'GG',
    'GILD',
    'GLD',
    'GM',
    'GOOG',
    'GOOGL',
    // 'GRPO',
    'GS',
    'HAL',
    'HYG',
    'IBB',
    'IBM',
    'INTC',
    'IWM',
    'IYR',
    // 'JCP',
    // 'JD',
    // 'JNUG',
    'JPM',
    // 'KMI',
    'KO',
    'KRE',
    // 'LB',
    'LULU',
    'LVS',
    'M',
    'MA',
    'MCD',
    'MDLZ',
    'MET',
    'MGM',
    // 'MJN',
    // 'MNKD',
    'MO',
    'MPC',
    'MRK',
    // 'MRO',
    'MS',
    'MSFT',
    'MU',
    'NEM',
    'NFLX',
    // 'NG',
    // 'NGD',
    'NKE',
    // 'NUGT',
    'NVDA',
    'NXPI',
    'ORCL',
    // 'P',
    // 'PBR',
    'PCLN',
    'PFE',
    // 'POT',
    'PRGO',
    // 'PYPL',
    'QCOM',
    'QQQ',
    // 'RAD',
    'RIG',
    'RL',
    'RSX',
    // 'RUT',
    // 'S',
    'SBUX',
    // 'SDRL',
    // 'SGYP',
    'SLB',
    // 'SLV',
    'SLW',
    // 'SMH',
    // 'SPX',
    'SPY',
    'STZ',
    'SVXY',
    'SYMC',
    'T',
    'TEVA',
    'TGT',
    'TLT',
    'TMUS',
    'TSLA',
    // 'TWTR',
    // 'TZA',
    // 'UA',
    // 'UAA',
    'UAL',
    // 'UNG',
    'UNH',
    'UPS',
    // 'USO',
    'UUP',
    // 'UVXY',
    'V',
    // 'VALE',
    // 'VIX',
    'VLO',
    'VNQ',
    // 'VRX',
    // 'VXX',
    'VZ',
    // 'WBA',
    'WDC',
    'WFC',
    'WFM',
    // 'WFT',
    'WMT',
    'WYNN',
    'X',
    // 'XBI',
    'XLE',
    'XLF',
    'XLI',
    'XLK',
    'XLU',
    'XLV',
    'XOM',
    // 'XOP',
    'XRT',
    // 'XRX',
  ];

  // symbols: string[] = [
  //   'AAPL',
  //   'AMGN',
  //   'AMZN',
  //   'APC',
  //   'BA',
  //   'BABA',
  //   'BIDU',
  //   'CAT',
  //   'CELG',
  //   'CMG',
  //   'COST',
  //   'CVX',
  //   'DE',
  //   'DIA',
  //   'EEM',
  //   'EFA',
  //   'EOG',
  //   'FB',
  //   'FDX',
  //   'FXE',
  //   'GILD',
  //   'GLD',
  //   // 'GMCR',
  //   'GOOGL',
  //   'GS',
  //   'HD',
  //   'IBM',
  //   'IWM',
  //   'IYR',
  //   // 'KMP',
  //   'LMT',
  //   // 'LNKD',
  //   'MON',
  //   //'NDX',
  //   'NFLX',
  //   // 'OEX',
  //   'OXY',
  //   'PCLN',
  //   'QQQ',
  //   // 'RUT',
  //   'SBUX',
  //   'SLB',
  //   // 'SNDK',
  //   // 'SPX',
  //   'SPY',
  //   'TIF',
  //   'TLT',
  //   'TSLA',
  //   'V',
  //   'VMW',
  //   'WYNN',
  //   'XLE',
  //   'XLU',
  //   'XOM',
  //   // 'XOP',
  //   'XRT',
  //   'ZMH',
  // ];

  constructor(private http: Http) {
    // let position: OptionPosition = new OptionPosition();
    // position.symbol = 'AAPL';
    // position.type = 'PUT';
    // position.entryAction = 'STO';
    // position.open = true;
    // position.actionDate = '1-2-17';
    // // position.daysToExpiration = 50;
    // position.expiration = '20170317';
    // position.price = 0.25;
    // position.numContracts = 100;
    // position.commission = 1.00;
    // position.strike = 125;
    // position.entryDelta = 0.12;
    // this.addPosition(position);
    //
    // position = new OptionPosition();
    // position.symbol = 'AAPL';
    // position.type = "CALL";
    // position.entryAction = 'BTO';
    // position.open = true;
    // position.actionDate = '1-2-17';
    // // position.daysToExpiration = 50;
    // position.expiration = '20170317';
    // position.price = 0.25;
    // position.numContracts = 100;
    // position.commission = 1.00;
    // position.strike = 125;
    // position.entryDelta = 0.12;
    // this.addPosition(position);
    //
    // position = new OptionPosition();
    // position.symbol = 'GOOGL';
    // position.type = 'PUT';
    // position.entryAction = 'STO';
    // position.open = true;
    // position.actionDate = '1-2-17';
    // // position.daysToExpiration = 50;
    // position.expiration = '20170317';
    // position.price = 0.25;
    // position.numContracts = 100;
    // position.commission = 1.00;
    // position.strike = 125;
    // position.entryDelta = 0.12;
    // this.addPosition(position);
    //
    // position = new OptionPosition();
    // position.symbol = 'GOOGL';
    // position.type = 'CALL';
    // position.entryAction = 'BTO';
    // position.open = true;
    // position.actionDate = '1-2-17';
    // // position.daysToExpiration = 50;
    // position.expiration = '20170317';
    // position.price = 0.25;
    // position.numContracts = 100;
    // position.commission = 1.00;
    // position.strike = 125;
    // position.entryDelta = 0.12;
    // this.addPosition(position);
  }

  public getOptionPositions(): OptionPositionMap {
    return this.positions;
  }

  public getStockOptionDatum(position: OptionPosition): StockOptionDatum {
    if(position) {
      let datums: StockOptionDatum[] = this.stockOptionDatums[position.symbol];
      if(datums) {
        datums = _.filter(datums, (item: StockOptionDatum) => item.call == position.isCall());
        datums = _.filter(datums, (item: StockOptionDatum) => item.strike == position.strike);
        datums = _.filter(datums, (item: StockOptionDatum) => item.expiration == position.expiration);
        if(datums && datums.length) {
          return datums[0];
        }
      }
    }

    return null;
  }

  public addPosition(position: OptionPosition) {
    position.symbol = position.symbol.trim().toUpperCase()
    let positions: OptionPosition[] = this.positions[position.symbol];
    if(!positions) {
      positions = [];
    }
    positions = _.filter(positions, (item: OptionPosition) => item.id != position.id);
    this.positions[position.symbol] = positions;
    positions.push(position);
  }

  public deletePosition(position: OptionPosition) {
    let positions: OptionPosition[] = this.positions[position.symbol];
    if(positions) {
      positions = _.filter(positions, (item: OptionPosition) => item.id != position.id);
    }
    this.positions[position.symbol] = positions;
  }

  public reset() {
    // this.stockIdx = 0;
    this.stockDatums = {};
    this.stockOptionDatums = {};
    this.callSpreads = {};
    this.putSpreads = {};
    this.condors = {};
    this.filteredCallSpreads = {};
    this.filteredPutSpreads = {};
    this.filteredCondors = {};
    // this.searchSymbols = [];
    this.filter = null;
    this.completeCb = null;
    this.loading = false;
    this.stockLoadingMap = {};
    this.stockOptionLoadingMap = {};
    this.volatilityLoadingMap = {};
  }

  public getSymbols(symbols: string[], filter: TradeFilter, completeCb: Function) {
    if (this.loading) {
      return;
    }

    this.startTime = (new Date).getTime();
    this.filter = filter;
    this.completeCb = completeCb;
    this.loading = true;

    let fetchOptions: FetchOptions = {
      searchSymbols: symbols,
      symbolIdx: 0,
      loadAdditional: true,
      applyFilter: true,
    };
    this.getNextSymbol(fetchOptions);
  }

  private getNextSymbol(options: FetchOptions) {
    if(options.symbolIdx < options.searchSymbols.length) {
      this.getLatestStockData(options);
    } else {
      this.calculateCreditSpreads();
      this.calculateCondors();

      options.symbolIdx = 0;
      this.loading = false;
      this.completeCb && this.completeCb(this.getFilteredSymbols());
      this.status.next('Loading data complete (' + (((new Date).getTime() - this.startTime) / 1000) + ' sec)');
    }
  }

  private getSessionParams(): URLSearchParams {
    let params: URLSearchParams = new URLSearchParams();
    this.session_id && params.set('session_id', this.session_id);
    this.login_date && params.set('login_date', this.login_date);
    return params;
  }

  private getStockData(params: URLSearchParams, options: FetchOptions) {
    if(options.symbolIdx >= options.searchSymbols.length) {
      return;
    }

    let symbol: string = options.searchSymbols[options.symbolIdx];
    options.symbolIdx++;

    if(this.stockLoadingMap[symbol]) {
      return;
    }

    params.set('symbols', symbol);

    this.status.next('Loading ' + symbol + ' stock data...');
    this.stockLoadingMap[symbol] = true;
    this.http.get('http://localhost:3000/stocks.json', { search: params }).map((res: Response) => res.json())
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

          this.stockLoadingMap[symbol] = false;

          options.loadAdditional && this.loadVolatility(symbol, options);
        },
        (error) => {
          console.log('*** error:', error);
          this.status.next(error);
        });
  }

  public getLatestStockData(options: FetchOptions) {
    if(!options.searchSymbols || !options.searchSymbols.length) {
      // console.error('getLatestStockData - symbol null');
      return;
    }

    let params: URLSearchParams = this.getSessionParams();
    params.set('latest', 'true');
    this.getStockData(params, options);
  }

  // private getHistoryStockData() {
  //   let params: URLSearchParams = this.getSessionParams();
  //   this.searchParams.symbols && params.set('symbols', this.searchParams.symbols);
  //   this.searchParams.historic && params.set('historic', this.searchParams.historic + "");
  //   this.searchParams.delete_existing && params.set('delete_existing', this.searchParams.delete_existing + "");
  //   this.getStockData(null, params);
  // }

  public getStockOptionData(symbol: string, options: FetchOptions) {
    if(this.stockOptionLoadingMap[symbol]) {
      return;
    }

    this.status.next('Loading ' + symbol + ' stock option data...');
    this.stockOptionLoadingMap[symbol] = true;

    let params: URLSearchParams = this.getSessionParams();
    params.set('symbols', symbol);
    params.set('minDaysExp', this.filter.minDaysExp + '');
    params.set('maxDaysExp', this.filter.maxDaysExp + '');

    this.http.get('http://localhost:3000/stock_options.json', { search: params })
      .map((res: Response) => res.json())
      .subscribe(
        (res) => {
          if(res.meta) {
            this.session_id = res.meta.session_id;
            this.login_date = res.meta.login_date;
          }

          this.stockOptionDatums[symbol] = [];
          res.data.stock_options && res.data.stock_options.forEach(datum => {
            let datumObj: StockOptionDatum = new StockOptionDatum();
            datumObj.accept(datum);
            datumObj.underlying = this.stockDatums[datumObj.symbol];

            if(this.filterOption(datumObj)) {
              this.addOption(datumObj);
            }
          });

          this.stockOptionLoadingMap[symbol] = false;

          options.loadAdditional && this.getNextSymbol(options);
        },
        (error) => {
          console.log('*** error:', error);
          this.status.next(error);
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
    if(option.daysToExpiration < this.filter.minDaysExp)
      return false;
    else if(option.daysToExpiration > this.filter.maxDaysExp)
      return false;
    return true;
  }

  public loadVolatility(symbol: string, options: FetchOptions) {
    if(this.volatilityLoadingMap[symbol]) {
      return;
    }

    this.status.next('Loading ' + symbol + ' volatility data...');
    this.volatilityLoadingMap[symbol] = true;

    let params: URLSearchParams = new URLSearchParams();
    this.session_id && params.set('session_id', this.session_id);
    this.login_date && params.set('login_date', this.login_date);
    params.set('symbols', symbol);

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

          this.volatilityLoadingMap[symbol] = false;

          this.status.next('Volatility loading complete.');

          if(options.loadAdditional) {
            let stock: StockDatum = this.stockDatums[symbol];
            if (!options.applyFilter || stock && stock.ivr >= this.filter.minIvr || (this.filter.symbolInput && this.filter.symbolInput.length)) {
              this.getStockOptionData(symbol, options);
            } else {
              this.getNextSymbol(options);
            }
          }
        },
        (error) => {
          console.log('*** error:', error);
          this.status.next(error);
        });
  }

  public calculateCreditSpreads() {
    this.status.next('Calculation credit spreads...');

    this.callSpreads = {};
    this.putSpreads = {};

    this.getFilteredSymbols().forEach((symbol: string) => {
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
          // let spreadPrice: number = o1.last - o2.last;

          let o1Price: number = o1.bid + ((o1.ask - o1.bid) / 2);
          let o2Price: number = o2.bid + ((o2.ask - o2.bid) / 2);
          o1Price = o1Price > 0 ? o1Price : o1.last;
          o2Price = o2Price > 0 ? o2Price : o2.last;

          let spreadPrice: number = o1Price - o2Price;
          if(o1.call)
            spreadPrice = o2Price - o1Price;

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

    this.status.next('Filtering spreads...');
    this.getFilteredSymbols().forEach((symbol: string) => {
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
    if(Math.abs(spread.shortOption.delta) > this.filter.maxDelta) {
      return false;
    }

    if(Math.abs(spread.shortOption.delta) < this.filter.minDelta) {
      return false;
    }

    if(spread.credit < this.filter.minSpreadCredit) {
      return false;
    }

    if(spread.margin > this.filter.maxSpreadMargin) {
      return false;
    }

    if(spread.shortOption.bidAskWidthPercentage > this.filter.maxBidAskPercent || spread.longOption.bidAskWidthPercentage > this.filter.maxBidAskPercent) {
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

  public calculateCondors() {
    this.status.next('Calculation condors...');

    this.condors = {};

    this.getFilteredSymbols().forEach((symbol: string) => {

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

    this.status.next('Filtering condors...');
    this.getFilteredSymbols().forEach((symbol: string) => {
      let condors: Condor[] = this.condors[symbol];
      this.filteredCondors[symbol] = [];
      condors && condors.forEach((condor: Condor) => {
        this.filterCondor(condor) && this.filteredCondors[symbol].push(condor);
      });
    });
  }

  private filterCondor(condor: Condor): boolean {
    if(condor.credit < this.filter.minCondorCredit) {
      return false;
    }

    if(condor.roc < this.filter.minCondorRoc) {
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

  private getFilteredSymbols(): string[] {
    let syms: string[] = _.keys(this.stockDatums);

    if(!this.filter.symbolInput || !this.filter.symbolInput.length) {
      syms = _.filter(syms, (item: string) => (this.stockDatums[item] && this.stockDatums[item].ivr >= this.filter.minIvr));
    }

    return _.sortBy(syms, (item: string) => (this.stockDatums[item] && this.stockDatums[item].ivr) || 0).reverse();
  }

}
