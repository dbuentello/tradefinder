import { Component, Input, OnInit } from '@angular/core';
import * as _ from "underscore"
import { Spread } from '../../model/spread'

@Component({
  selector: 'spread',
  templateUrl: 'spread.component.html',
  styleUrls: ['spread.component.css']
})
export class SpreadComponent implements OnInit {

  private _spreads: Spread[];
  @Input() set spreads(spreads) {
    this._spreads = spreads;
    this._spreads && (this._spreads = _.sortBy(this._spreads, (item: Spread) => item.roc).reverse());
  }

  get spreads(): Spread[] {
    return this._spreads;
  }

  @Input()
  maxSpreads: number = 5;

  @Input()
  selectedSpread: Spread = null;

  constructor() {
  }

  ngOnInit() {
  }


}
