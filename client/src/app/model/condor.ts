import {Spread} from "./spread";

export class Condor {

  putSpread: Spread;
  callSpread: Spread;
  credit: number;
  maxLoss: number;
  roc: number;
  rocWithComm: number;
  rocWithCommAdj: number;
  probProfit: number;
  probOTM: number;
  strikeStr: string;
  deltaStr: string;

  constructor(p: Spread, c: Spread) {
    this.putSpread = p;
    this.callSpread = c;

    this.credit = this.putSpread.credit + this.callSpread.credit;
    let creditScaled: number = this.credit * 100;
    this.maxLoss = this.putSpread.margin - creditScaled;
    this.roc = (creditScaled / this.maxLoss) * 100;
    this.probProfit = 100 - ((100 - this.putSpread.probOfProfit) + (100 - this.callSpread.probOfProfit));
    this.probOTM = 100 - ((100 - this.putSpread.shortOption.probOTM) + (100 - this.callSpread.shortOption.probOTM));

    let putComm: number = this.putSpread.commissionAmount;
    let callComm: number = this.callSpread.commissionAmount;
    this.rocWithComm = ((creditScaled - putComm - callComm) / this.maxLoss) * 100;
    this.rocWithCommAdj = ((creditScaled - (putComm * 2) - callComm) / this.maxLoss) * 100; // ROC with commission after adjusting one side

    this.strikeStr = this.putSpread.longOption.strike + "/" + this.putSpread.shortOption.strike + " " + this.callSpread.shortOption.strike + "/" + this.callSpread.longOption.strike;
    this.deltaStr = this.putSpread.shortOption.delta + " /" + this.callSpread.shortOption.delta;
    // this.deltaStr = OptionParser.formatTwoDigits(putSpread.shortOption.delta) + "|" + OptionParser.formatTwoDigits(callSpread.shortOption.delta);
  }

}
