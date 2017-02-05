import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Headers, Http, Response, URLSearchParams } from '@angular/http'
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import * as _ from 'underscore';

import { StockDatum } from '../../model/stock-datum';
import { StockOptionDatum } from '../../model/stock-option-datum';
import { Spread } from '../../model/spread';
import { Condor } from '../../model/condor';

import { OptionDataService, OptionPositionMap } from '../../service/option-data.service';
import {OptionPosition} from "../../model/option-position";
import {PositionInputStateService} from "../../service/position-input-state.service";

@Component({
  selector: 'positions',
  templateUrl: 'positions.component.html',
  styleUrls: [
    'positions.component.css',
  ]
})

export class PositionsComponent implements OnInit {

  status: string = '';
  loading: boolean = false;

  positions: OptionPositionMap;

  constructor(private http: Http,
              private optionService: OptionDataService,
              private inputService: PositionInputStateService) {
    this.positions = this.optionService.getOptionPositions();
  }

  public ngOnInit(): void {
  }

  private getCurrentDate(): string {
    return (new Date()).toDateString();
  }

  private getPositionSymbols(): string[] {
    return _.keys(this.positions).sort();
  }

  inputCanceled() {
    this.inputService.showInput = false;
    this.inputService.position = null;
  }

  // inputSaved(newPosition: OptionPosition) {
  //   if(newPosition.symbol) {
  //     newPosition.symbol = newPosition.symbol.toUpperCase().trim();
  //     let positions: OptionPosition[] = this.positions[newPosition.symbol];
  //     if(!positions) {
  //       positions = [];
  //       this.positions[newPosition.symbol] = positions;
  //     }
  //     positions.push(newPosition);
  //   }
  //
  //   console.log('positions:', this.positions);
  // }

  showInput() {
    this.inputService.position = new OptionPosition();
    this.inputService.showInput = true;
  }

}
