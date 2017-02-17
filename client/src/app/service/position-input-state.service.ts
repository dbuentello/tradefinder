import {Injectable} from "@angular/core";
import * as _ from 'underscore';

import {OptionPosition} from "../model/option-position";
import {Condor} from '../model/condor';
import {Spread} from '../model/spread';

@Injectable()
export class PositionInputStateService {

  private _showInput: boolean = false;
  set showInput(show: boolean) {
    this._showInput = show;
  }
  get showInput() {
    return this._showInput;
  }

  private _positions: OptionPosition[] = [];
  set positions(pos: OptionPosition[]) {
    this._positions = [];
    pos && pos.forEach((p: OptionPosition) => this._positions.push(_.clone(p)));
  }
  get positions() {
    return this._positions;
  }

  public addPosition(position: OptionPosition) {
    if(position) {
      if(_.findIndex(this._positions, (pos: OptionPosition) => position.id == pos.id) < 0) {
        this._positions.push(position);
      }
    }
  }

  public addCondorPosition(condor: Condor) {
    this.addSpreadPosition(condor.callSpread);
    this.addSpreadPosition(condor.putSpread);
  }

  public addSpreadPosition(spread: Spread) {
    let date = new Date();
    let dateStr: string = '' + date.getFullYear() + (date.getMonth() + 1) + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());

    let position: OptionPosition = new OptionPosition();
    position.actionDate = dateStr;
    position.open = true;
    position.symbol = spread.shortOption.symbol;
    position.expiration = spread.shortOption.expiration;
    position.strike = spread.shortOption.strike;
    position.price = spread.shortOption.bid;
    position.entryAction = 'STO';
    position.closingAction = 'BTC';
    position.type = spread.shortOption.getTypeString();
    position.entryDelta = spread.shortOption.delta * -1;
    position.numContracts = 1;
    this._positions.push(position);

    position = new OptionPosition();
    position.actionDate = dateStr;
    position.open = true;
    position.symbol = spread.longOption.symbol;
    position.expiration = spread.longOption.expiration;
    position.strike = spread.longOption.strike;
    position.price = spread.longOption.ask * -1;
    position.entryAction = 'BTO';
    position.closingAction = 'STC';
    position.type = spread.longOption.getTypeString();
    position.entryDelta = spread.longOption.delta;
    position.numContracts = 1;
    this._positions.push(position);
  }

}
