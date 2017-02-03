import {StockDatum} from "./stock-datum";

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

  accept(data: any) {
    this.symbol = data.symbol;
    this.call = data.call;
    this.description = data.description;
    this.daysToExpiration = data.daysToExpiration;
    this.expiration = data.expiration;
    this.strike = data.strike;
    this.last = data.last;
    this.bid = data.bid;
    this.ask = data.ask;
    this.volume = data.volume;
    this.iv = data.iv;
    this.delta = data.delta;
    this.gamma = data.gamma;
    this.theta = data.theta;
    this.vega = data.vega;
  }

}
