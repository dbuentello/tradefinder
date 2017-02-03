import {StockOptionDatum} from "./stock-option-datum";

export class Spread {

  shortOption: StockOptionDatum;
  longOption: StockOptionDatum;

  strikeWidth: number;
  credit: number;
  roc: number;
  rocWithCommission: number;
  rocWithCommAdj: number;
  maxLoss: number;
  commission: number;
  targetProfit: number;
  margin: number;
  probOfProfit: number;
  commissionAmount: number;
  IV: number;

  constructor() {}

  public calculateValues() {
    let perContractPrice: number = 1.5;
    //targetProfit = credit * 100f * 0.5f;
    this.targetProfit = this.credit * 100;
    this.maxLoss = this.margin - (this.credit * 100);
    this.roc = (this.credit / (this.strikeWidth - this.credit)) * 100;

    this.commissionAmount = perContractPrice * 4; // Includes both selling and buying back
    let commissionPercentage: number = (this.commissionAmount / this.targetProfit) * 100;

    this.commission = commissionPercentage;
    this.rocWithCommission = ((this.targetProfit - this.commissionAmount) / this.margin) * 100;
    this.rocWithCommAdj = ((this.targetProfit - (this.commissionAmount * 2)) / this.margin) * 100;

    // POP
    //probOfProfit = ((margin - (credit * 100)) / margin) * 100;
    this.probOfProfit = 100 - (((this.credit * 100) / this.margin) * 100);

    if(this.shortOption && this.shortOption.underlying && this.shortOption.underlying.last > 0)
      this.shortOption.percentFromMarket = (Math.abs(this.shortOption.strike - this.shortOption.underlying.last) / this.shortOption.underlying.last) * 100;
    else
      console.log('underlying null for: ' + this.shortOption.symbol);

    if(this.longOption && this.longOption.underlying && this.longOption.underlying.last > 0)
      this.longOption.percentFromMarket = (Math.abs(this.longOption.strike - this.longOption.underlying.last) / this.longOption.underlying.last) * 100;
    else
      console.log('underlying null for: ' + this.longOption.symbol);
  }

}
