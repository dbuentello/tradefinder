import {Injectable} from "@angular/core";
import {OptionPosition} from "../model/option-position";
import * as _ from 'underscore';

export interface OptionPositionMap {
  [symbol: string]: OptionPosition[];
}

@Injectable()
export class OptionDataService {

  positions: OptionPositionMap = {};

  constructor() {
    let position: OptionPosition = new OptionPosition();
    position.symbol = 'AAPL';
    position.type = 'PUT';
    position.entryAction = 'STO';
    position.open = true;
    position.actionDate = '1-2-17';
    position.daysToExpiration = 50;
    position.price = 0.25;
    position.numContracts = 100;
    position.commission = 1.00;
    position.strike = 125;
    position.entryDelta = 0.12;
    this.addPosition(position);

    position = new OptionPosition();
    position.symbol = 'AAPL';
    position.type = "CALL";
    position.entryAction = 'BTO';
    position.open = true;
    position.actionDate = '1-2-17';
    position.daysToExpiration = 50;
    position.price = 0.25;
    position.numContracts = 100;
    position.commission = 1.00;
    position.strike = 125;
    position.entryDelta = 0.12;
    this.addPosition(position);

    position = new OptionPosition();
    position.symbol = 'GOOGL';
    position.type = 'PUT';
    position.entryAction = 'STO';
    position.open = true;
    position.actionDate = '1-2-17';
    position.daysToExpiration = 50;
    position.price = 0.25;
    position.numContracts = 100;
    position.commission = 1.00;
    position.strike = 125;
    position.entryDelta = 0.12;
    this.addPosition(position);

    position = new OptionPosition();
    position.symbol = 'GOOGL';
    position.type = 'CALL';
    position.entryAction = 'BTO';
    position.open = true;
    position.actionDate = '1-2-17';
    position.daysToExpiration = 50;
    position.price = 0.25;
    position.numContracts = 100;
    position.commission = 1.00;
    position.strike = 125;
    position.entryDelta = 0.12;
    this.addPosition(position);
  }

  public getOptionPositions(): OptionPositionMap {
    return this.positions;
  }

  public addPosition(position: OptionPosition) {
    let positions: OptionPosition[] = this.positions[position.symbol];
    if(!positions) {
      positions = [];
    }
    positions = _.filter(positions, (item: OptionPosition) => item.id != position.id);
    this.positions[position.symbol] = positions;
    positions.push(position);
  }

  public deletePosition(position: OptionPosition) {
    let positions: OptionPosition[] = this.positions[position.symbol];
    if(positions) {
      positions = _.filter(positions, (item: OptionPosition) => item.id != position.id);
    }
    this.positions[position.symbol] = positions;
  }

}
