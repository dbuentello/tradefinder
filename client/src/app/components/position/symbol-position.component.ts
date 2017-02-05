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

  @Input()
  positions: OptionPosition[];

  show: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  clicked() {
    this.show = !this.show;
  }

}
