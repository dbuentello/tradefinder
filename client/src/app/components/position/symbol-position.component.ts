import { Component, OnInit, Input } from '@angular/core';
import {OptionPosition} from "../../model/option-position";
import * as _ from 'underscore'

@Component({
  selector: 'symbol-position',
  templateUrl: 'symbol-position.component.html',
  styleUrls: ['symbol-position.component.css']
})
export class SymbolPositionComponent implements OnInit {

  @Input()
  symbol: string;

  _positions: OptionPosition[];
  @Input() set positions(ops: OptionPosition[]) {
    this._positions = _.sortBy(ops, (op: OptionPosition) => op.strike);
  }
  get positions(): OptionPosition[] {
    return this._positions;
  }

  show: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  clicked() {
    this.show = !this.show;
  }

  selectedPositions(): OptionPosition[] {
    return this.positions.filter((item: OptionPosition) => item.selected);
  }

}
