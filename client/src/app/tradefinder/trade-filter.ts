export class TradeFilter {

  symbolInput: string = '';
  minIvr: number = 0.35;
  minDelta: number = 0.05;
  maxDelta: number = 0.15;
  minDaysExp: number = 20;
  maxDaysExp: number = 60;
  minSpreadCredit: number = 0.20;
  maxBidAskPercent: number = 0.20;
  maxSpreadMargin: number = 1000;
  minCondorCredit: number = 0.40;
  minCondorRoc: number = 8;
  maxSpreads: number = 10;
  maxCondors: number = 10;

  constructor() {
    this.resetFilters();
  }

  public resetFilters() {
    this.symbolInput = '';
    this.minIvr = 0.35;
    this.minDelta = 0.05;
    this.maxDelta = 0.15;
    this.minDaysExp = 20;
    this.maxDaysExp = 60;
    this.minSpreadCredit = 0.20;
    this.maxBidAskPercent = 0.20;
    this.maxSpreadMargin = 1000;
    this.minCondorCredit = 0.40;
    this.minCondorRoc = 8;
    this.maxSpreads = 10;
    this.maxCondors = 10;
  }

}
