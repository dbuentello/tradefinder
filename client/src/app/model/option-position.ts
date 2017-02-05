
import { StockOptionDatum } from './stock-option-datum';
import { Spread } from './spread';

// export enum OptionType {
//   CALL,
//   PUT
// }
//
// export enum OptionAction {
//   STO,
//   STC,
//   BTO,
//   BTC,
// }

export class OptionPosition {

  private static uniqueId: number = 0;

  id: number;
  symbol: string;
  open: boolean;
  actionDate: string;
  daysToExpiration: number;

  price: number;
  // _entryAction: OptionAction;
  entryAction: string;
  commission: number;
  numContracts: number;

  strike: number;
  // type: OptionType;
  type: string;
  entryDelta: number;

  constructor() {
    this.id = OptionPosition.uniqueId++;
  }

  // set entryAction(action) {
  //   this._entryAction = action;
  // }

  // get entryAction() {
  //   return this._entryAction;
  // }

}
