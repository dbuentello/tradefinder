import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Headers, Http, Response, URLSearchParams } from '@angular/http'
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import * as _ from 'underscore';

import { StockDatum } from '../model/stock-datum';
import { StockOptionDatum } from '../model/stock-option-datum';
import { Spread } from '../model/spread';
import { Condor } from '../model/condor';

import { OptionDataService } from '../service/option-data.service';
import {OptionPosition} from "../model/option-position";

@Component({
  selector: 'monitor',
  templateUrl: 'monitor.component.html',
  styleUrls: [
    'monitor.component.css',
  ]
})

export class MonitorComponent implements OnInit {

  loading: boolean = false;

  constructor(private http: Http) {
  }

  public ngOnInit(): void {
  }

  private getCurrentDate(): string {
    return (new Date()).toDateString();
  }

}
