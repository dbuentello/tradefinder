export class StockDatum {

    id: string;
    symbol: string;
    date: string;
    description: string;
    last: number;
    close: number;
    open: number;
    high: number;
    low: number;
    bid: number;
    ask: number;
    volume: number;
    percentChange: number;
    ivr: number;
    iv: number;
    created_at: string;
    updated_at: string;


    accept(data: any) {
      this.id = data.id;
      this.symbol = data.symbol;
      this.date = data.date;
      this.description = data.description;
      this.last = data.last;
      this.close = data.close;
      this.open = data.open;
      this.high = data.high;
      this.low = data.low;
      this.bid = data.ask;
      this.volume = data.volume;
      this.last = data.last;
      this.percentChange = data.percentChange;
      this.ivr = data.ivr;
      this.iv = data.iv;
      this.created_at = data.created_at;
      this.updated_at = data.updated_at;
    }

}
