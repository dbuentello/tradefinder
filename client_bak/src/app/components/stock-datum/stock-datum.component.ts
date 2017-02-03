import { Component, Input, OnInit } from '@angular/core';

import { StockDatum } from '../../model/stock-datum'

@Component({
  selector: 'stock-datum',
  templateUrl: './stock-datum.component.html',
  styleUrls: ['./stock-datum.component.css']
})
export class StockDatumComponent implements OnInit {

  @Input()
  stockDatum: StockDatum;

  constructor() {
  }


  ngOnInit() {
  }


}
