import {StockDatum} from "./stock-datum";

export const PUT = 'PUT';
export const CALL = 'CALL';

export class StockOptionDatum {

  underlying: StockDatum;

  symbol: string;
  call: boolean;
  description: string;
  daysToExpiration: number;
  expiration: string;
  strike: number;
  last: number;
  bid: number;
  ask: number;
  volume: number;
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  percentFromMarket: number;
  probOTM: number;
  bidAskWidthPercentage: number;

  accept(data: any) {
    this.symbol = data.symbol;
    this.call = data.call;
    this.description = data.description;
    this.daysToExpiration = data.daysToExpiration && parseFloat(data.daysToExpiration);
    this.expiration = data.date;
    this.strike = data.strike && parseFloat(data.strike);
    this.last = data.last && parseFloat(data.last);
    this.bid = data.bid && parseFloat(data.bid);
    this.ask = data.ask && parseFloat(data.ask);
    this.volume = data.volume && parseFloat(data.volume);
    this.iv = data.iv && parseFloat(data.iv);
    this.delta = data.delta && parseFloat(data.delta);
    this.gamma = data.gamma && parseFloat(data.gamma);
    this.theta = data.theta && parseFloat(data.theta);
    this.vega = data.vega && parseFloat(data.vega);

    this.bidAskWidthPercentage = (this.ask - this.bid) / this.ask;
  }

  public getTypeString() {
    return this.call ? 'CALL' : 'PUT';
  }

}
