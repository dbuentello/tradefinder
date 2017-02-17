import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {StockDatum} from '../../model/stock-datum';
import {OptionPosition} from "../../model/option-position";
import {OptionDataService, FetchOptions} from "../../service/option-data.service";
import {Observable, Subject} from "rxjs";
import * as _ from 'underscore';
import {StockOptionDatum} from "../../model/stock-option-datum";

@Component({
  selector: 'position-summary',
  templateUrl: 'position-summary.component.html',
  styleUrls: ['position-summary.component.css']
})
export class PositionSummaryComponent implements OnInit, OnChanges {

  _positions: OptionPosition[];
  @Input()
  set positions(pos: OptionPosition[]) {
    if (!this._positions || !_.isEqual(this._positions, pos)) {
      this._positions = pos;

      let sym: string = this.getSymbol();
      let fetchOptions: FetchOptions = {
        searchSymbols: sym ? [sym] : [],
        symbolIdx: 0,
        loadAdditional: true,
        applyFilter: false,
      };
      this.optionService.getLatestStockData(fetchOptions);
    }
  }

  get positions() {
    return this._positions;
  }

  constructor(private optionService: OptionDataService) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
  }

  public getSymbol() {
    if (this.positions && this.positions.length) {
      return this.positions[0].symbol;
    }
    return null;
  }

  public getSelectedValue(): number {
    let price: number = this.getSelectedPrice();

    return this.getCredit(true) + this.getCredit(false) + price;
  }

  public getSelectedPrice(): number {
    if(this._positions) {
      let selected: OptionPosition[] = _.filter(this._positions, (pos: OptionPosition) => pos.selected);
      let prices: number[] = [];
      selected.forEach((pos: OptionPosition) => {
        // let option: StockOptionDatum = this.optionService.getStockOptionDatum(pos);
        // if(pos) {
        //   prices.push(pos.entryAction == 'BTO' ? option.last * -1 : option.last);
        // }

        let current: number = this.getPositionCurrentValue(pos);
         prices.push(pos.entryAction == 'STO' ? current * -1 : current);
      });

      let sum: number = _.reduce(prices, (memo: number, num: number) => memo + num, 0);
      return this.scaleByContracts(sum);
    }

    return 0;
  }

  public getDelta(position: OptionPosition): number {
    let option: StockOptionDatum = this.optionService.getStockOptionDatum(position);
    if(option) {
      return position.isShort() ? option.delta * -1 : option.delta;
    }
    return 0;
  }

  public getGamma(position: OptionPosition): number {
    let option: StockOptionDatum = this.optionService.getStockOptionDatum(position);
    if(option) {
      return position.isShort() ? option.gamma * -1 : option.gamma;
    }
    return 0;
  }

  public getTheta(position: OptionPosition): number {
    let option: StockOptionDatum = this.optionService.getStockOptionDatum(position);
    if(option) {
      return position.isShort() ? option.theta * -1 : option.theta;
    }
    return 0;
  }

  public getVega(position: OptionPosition): number {
    let option: StockOptionDatum = this.optionService.getStockOptionDatum(position);
    if(option) {
      return position.isShort() ? option.vega * -1 : option.vega;
    }
    return 0;
  }

  public getSelectedDelta(): number {
    return this.getSelectedGreek('delta');
  }

  public getSelectedGamma(): number {
    return this.getSelectedGreek('gamma');
  }

  public getSelectedTheta(): number {
    return this.getSelectedGreek('theta');
  }

  public getSelectedVega(): number {
    return this.getSelectedGreek('vega');
  }

  private getSelectedGreek(greek: string): number {
    if(this._positions && greek) {
      let selected: OptionPosition[] = _.filter(this._positions, (pos: OptionPosition) => pos.selected);
      let deltas: number[] = [];
      selected.forEach((pos: OptionPosition) => {
        if(pos) {
          switch(greek.toLowerCase()) {
            case 'delta':
              deltas.push(this.getDelta(pos));
              break;
            case 'gamma':
              deltas.push(this.getGamma(pos));
              break;
            case 'theta':
              deltas.push(this.getTheta(pos));
              break;
            case 'vega':
              deltas.push(this.getVega(pos));
              break;
          }
        }
      });

      let sum: number = _.reduce(deltas, (memo: number, num: number) => memo + num, 0);
      return this.scaleByContracts(sum);
    }

    return 0;
  }

  public scaleByContracts(val: number): number {
    if(this._positions.length) {
      let numContracts: number = this._positions[0].numContracts;
      if(this._positions.every((pos: OptionPosition) => pos.numContracts == numContracts)) {
        return val * 100 * numContracts;
      }
    }
    return val;
  }


  public getCalls(): OptionPosition[] {
    return _.sortBy(_.filter(this.positions, (op: OptionPosition) => op.isCall()), (op: OptionPosition) => op.strike);
  }

  public getPuts(): OptionPosition[] {
    return _.sortBy(_.filter(this.positions, (op: OptionPosition) => !op.isCall()), (op: OptionPosition) => op.strike);
  }

  public getReturn(): number {
    return (this.getSelectedValue() / this.getMargin()) * 100;
  }

  public getMargin(): number {
    let calls: OptionPosition[] = this.getCalls();
    let puts: OptionPosition[] = this.getPuts();

    let callMargin: number = -1;
    let putMargin: number = -1;

    if(calls.length == 2 && calls[0].numContracts == calls[1].numContracts) {
      callMargin = (calls[1].strike - calls[0].strike) * calls[0].numContracts;
    }

    if(puts.length == 2 && puts[0].numContracts == puts[1].numContracts) {
      putMargin = (puts[1].strike - puts[0].strike) * puts[0].numContracts;
    }

    return Math.max(callMargin, putMargin) * 100;
  }

  public getMarginStr(): string {
    let margin: number = this.getMargin();
    return margin > 0 ? margin + '' : '0';
  }

  public getCredit(call: boolean): number {
    let credit: number = 0;
    if(call) {
      let calls: OptionPosition[] = this.getCalls();
      if(calls.length == 2 && calls[0].numContracts == calls[1].numContracts) {
        credit = calls[0].price + calls[1].price;
      }
    }
    else {
      let puts: OptionPosition[] = this.getPuts();
      if(puts.length == 2 && puts[0].numContracts == puts[1].numContracts) {
        credit = puts[0].price + puts[1].price;
      }
    }

    return this.scaleByContracts(credit);
  }

  public getPositionCurrentValue(position: OptionPosition): number {
    // Return the cost required to buy back (ask) or sell back (ask) the option
    let option: StockOptionDatum = this.optionService.getStockOptionDatum(position);
    if(option) {
      return position.isShort() ? option.ask : option.bid;
    }
    return 0;
  }

  public getMaxROC(): number {
    return ((this.getCredit(true) + this.getCredit(false)) / this.getMargin()) * 100;
  }

}
