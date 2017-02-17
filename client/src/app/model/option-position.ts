import { StockOptionDatum, CALL, PUT } from './stock-option-datum';
import { Spread } from './spread';

export class OptionPosition {

  private static uniqueId: number = 0;

  id: number;
  symbol: string;
  open: boolean;
  actionDate: string;
  // daysToExpiration: number;
  expiration: string;

  price: number;
  entryAction: string;
  closingAction: string;
  commission: number;
  numContracts: number;

  strike: number;
  type: string;
  entryDelta: number;

  closingPrice: number;
  closingDate: string;

  selected: boolean = false;

  constructor() {
    this.id = OptionPosition.uniqueId++;
  }

  isCall(): boolean {
    return this.type && this.type.toUpperCase() == CALL;
  }

  getActionStr(): string {
    return this.isShort() ? 'Short' : 'Long';
  }

  isShort() {
    return this.entryAction == 'STO';
  }

}
